const port = process.env.PORT || 3000;
const express = require('express');
const app = express();
const {Pool } = require('pg');
const bodyParser = require('body-parser');
const alert = require('alert');
const path = require('path');
const nodemailer = require('nodemailer');
const schedule = require('node-schedule');
const fs = require('fs');

app.use(express.json({extended: false}));
app.use(bodyParser.urlencoded({ extended: false }))
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});


const conn = process.env.DATABASE_URL;
console.log(conn);
const pool = new Pool({
  connectionString: conn,
  ssl: { rejectUnauthorized: false }
});

// const pool = new Pool({
//     host: 'localhost',
//     user: 'postgres',
//     database: 'test',
//     password: 'password',
//     port: 5432,
// });

app.use(express.static("views/"));

// app.post('/',(req,res) => {
//    // res.sendFile('views/sign-in/', {root: __dirname});
//    app.use(express.static('views/'));
//    // res.sendFile('dist/index.html', {root:__dirname});
// });

app.post('/signup', (req, res) => {
      console.log('got signup page request');
      res.sendFile('views/signup.html', {root:__dirname});
});

app.post('/', (req, res) => {
      console.log('New User Registration request received');
      console.log(req.body);
      var otp = generateOTP();
      console.log(otp);
      res.sendFile('views/index.html', {root:__dirname});
});

app.post('/verifyEmail', (req,res) => {
    console.log(req.body);
    // res.sendFile('views/signup.html', {root:__dirname});
    var otp = generateOTP();
    console.log(otp);
    var {name, email, phone, password} = req.body;
    const insertUser = 'INSERT INTO signin values($1,$2,$3,$4,$5,$6);';
    pool.query(insertUser,[email, name, phone, password, otp, 'false']);
    SendOTP(req.body.email, otp);
    res.write('Otp Sent to the given mailId');
    res.end();
});

app.post('/verifyOTP', async (req,res) => {
    console.log(req.body);
    const verifyOTP = 'select username, otp from signin WHERE username = $1;';
    var verify = false;
    await pool.query(verifyOTP, [req.body.email])
      .then((result) => {
        if (result.rowCount) {
          console.log(result.rows[0].otp+ "  "+req.body.otp);
          if (result.rows[0].otp == req.body.otp) {
            pool.query('update signin set verified = true where username = $1', [req.body.email]);
            verify = true;
          }
        }
      })
      .catch ((err) => {
        console.log(err);
      });
      if (verify) {
        res.setHeader('Content-Type', 'text/plain');
        res.write("Otp verification Success");
        res.end();
      } else {
        res.setHeader('Content-Type', 'text/plain');
        res.write("Please Enter Correct OTP.");
        res.end();
      }

});

app.get('/privacy', (req, res) => {
      console.log('privacy page request');
      res.sendFile('views/privacy.html', {root:__dirname});
});

app.get('/admission', (req, res) => {
      console.log('got admission page request');
      res.sendFile('views/admissionForm.html', {root:__dirname});
});

app.get('/MorningLateComers', (req,res) => {
  console.log('MorningLateComers request received');
    res.sendFile(path.resolve('views/earlyMorning.html'));
});

app.get('/LunchLateComers', (req,res) => {
  console.log('LunchLateComers request received');
    res.sendFile(path.resolve('views/afterLunch.html'));
});

app.get('/bunkers', (req,res) => {
  console.log('Bunkers request received');
    res.sendFile(path.resolve('views/bunkers.html'));
});

app.get('/visitors', (req,res) => {
  console.log('Visitors request received');
    res.sendFile(path.resolve('views/visitors.html'));
});

app.post('/index',async (req,res) => {
    var username = req.body.username;
    var password = req.body.password;
    console.log(username + " " + password);
    const fetch_query = "select * from signin where username = $1";
    var signin = false;
    await pool.query(fetch_query,[username])
        .then((res) => {
            if(res.rowCount){
                var user = res.rows[0].username;
                var pass = res.rows[0].password;
                var verified = res.rows[0].verified;
                console.log(user +" "+ pass);
                if(username === user && password === pass && verified == true){
                    signin = true;
                }
            }
        })
        .catch((err) => {
          console.log("Error in Querying");
          console.log(err);
        });
        if(signin){
            res.sendFile(path.resolve('views/dashboard.html'));
            console.log('Successfully Logged  In!');
            alert("Successfully Logged In!");
        } else{
            res.redirect('/');
            console.log("Invalid Username or Password");
            alert('Invalid Username or Password');
        }
});

app.get('/select', (req, res) => {
    const select_query = "SELECT * from entries;";
    pool.query(select_query, (err, result) => {
        if(err){
          console.log(`Error Occurred ${err}`);
          return;
        }
        console.log(result.rows.length + " Records Found");
        res.send(result.rows);
    });
});

app.get('/selectVisitor', (req,res) => {
  const selectVisitor = "SELECT * from visitors order by visitor_no desc;";
  pool.query(selectVisitor, (err,result) => {
    if(err){
      console.log(err);
      return;
    }
    console.log(result.rows.length + " Visitor Records Found.");
    res.send(result.rows);
  })
});

app.get('/bunked_people', async (req,res) => {
  const bunkers_query = "SELECT * from bunkers;";
  pool.query(bunkers_query, (err, result) => {
    if(err){
      console.log(err);
    } else {
      console.log(result.rowCount + " Bunked People Records Found!");
      res.send(result.rows);
    }
  });

});

app.get('/inMorning', (req,res) => {
    const inMorning_query = "SELECT * from late_comers WHERE status = 'IN' and at_time between '8:35 AM' and '10:15 AM';";
    pool.query(inMorning_query, (err, result) => {
      if(err){
        console.log(err);
        return;
      } else {
        console.log(result.rowCount + " Early Morning Late Comers results Found!");
        res.send(result.rows);
      }
    });
});

app.get('/afterLunch', (req,res) => {
    const afterLunch_query = "SELECT * from late_comers WHERE status = 'IN' and at_time between '1:20 PM' and '2:30 PM';";
    pool.query(afterLunch_query, (err, result) => {
      if(err){
        console.log(err);
        return;
      } else {
        console.log(result.rowCount + " After Lunch Late Comers results Found!");
        res.send(result.rows);
      }
    });
});

app.post('/insertAdmission', async (req, res) => {
  if (req.body.status == 'IN') {
    console.log(req.body);
    const {first_name, phone_no, status, at_time, on_date} = req.body;
    let rollNo, visitor_no, reason_for_visiting;
    const insert_entries_query = "INSERT into entries VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);";
    const insert_admission_query = "INSERT into admissionTable (admission_no, first_name, phone_no, time_in, on_date) VALUES($1, $2, $3, $4, $5);" ;
    try {
      var result = await pool.query('select max(admission_no) from admissionTable');
      var admission_no = result.rows[0].max;
      admission_no += 1;
        pool.query(insert_entries_query, [rollNo,status, at_time, on_date, visitor_no, phone_no, reason_for_visiting, admission_no, first_name]);
        pool.query(insert_admission_query, [admission_no, first_name, phone_no, at_time, on_date]);
        console.log("Insert admission Successfully");
        res.status(200);
        res.setHeader('Content-Type', 'text/plain');
        res.end(admission_no.toString());
    } catch (e) {
        console.log(e);
    }
  } else {
    console.log(req.body);
    const {admission_no, at_time, on_date} = req.body;
    const update_admission = "update admissionTable set time_out = $1 WHERE admission_no = $2 and admissionTable.on_date = $3;";
    try {
      pool.query(update_admission, [at_time, admission_no,on_date]);
      console.log('update_admission Successful');
      res.status(200);
      res.setHeader('Content-Type', 'text/plain');
      res.end();
    } catch (e) {
      console.log(e);
    }
  }
});

app.post('/insertAdmissionDetails', (req, res) => {
  console.log(req.body);
  const insertAdmissionDetails = 'INSERT INTO admissiondetails values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22);';
  // const { student_first_name, student_last_name, father_first_name, father_last_name, mother_first_name, mother_last_name, email, student mobile number, dob, address, city, state, zip, parent_mobile_number_1, parent_mobile_number_2, course_1, course_2, school, x_marks, xii_marks, cutoff_marks, exampleRadios } = req.body;
  // const student_first_name = req.body.student_first_name;
  // const student_last_name = req.body.student_last_name;
  // const father_first_name = req.body.father_first_name;
  // const father_last_name = req.body.father_last_name;
  // const mother_first_name = req.body.mother_first_name;
  // const mother_last_name = req.body.mother_last_name;
  const {student_first_name, student_last_name, father_first_name, father_last_name, mother_first_name, mother_last_name} = req.body;
  const {email, student_mobile_number, dob, address, city, state, zip, parent_mobile_number_1, parent_mobile_number_2} = req.body;
  const {course_1, course_2, school, x_marks, xii_marks, cutoff_marks, exampleRadios} = req.body;
  pool.query(insertAdmissionDetails,[student_first_name, student_last_name, father_first_name, father_last_name, mother_first_name, mother_last_name, email, student_mobile_number, dob, address, city, state, zip, parent_mobile_number_1, parent_mobile_number_2, course_1, course_2, school, x_marks, xii_marks, cutoff_marks, exampleRadios])
  res.sendFile(path.resolve('views/dashboard.html'));
  // res.sendStatus(200);
});

app.post('/insertStudent', async (req, res) => {
  console.log('Inside student insertion');
  const {rollNo, status, at_time, on_date} = req.body;
  let admission_no, visitor_no, phone_no, first_name, reason_for_visiting;
  const insert_entries_query = "INSERT into entries VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);";
  const insert_student_query = "INSERT into student VALUES($1, $2, $3, $4);";
  const insert_bunker_query = "INSERT into bunkers VALUES($1, $2, $3, $4);";
  const remove_bunker = "DELETE from bunkers WHERE roll_no = $1;";
  const late_comers = "INSERT into late_comers VALUES($1, $2, $3, $4);";
  try {
      pool.query(insert_entries_query, [rollNo,status, at_time, on_date, visitor_no, phone_no, reason_for_visiting, admission_no, first_name]);
      pool.query(insert_student_query, [rollNo, status, at_time, on_date]);
      if (status == 'OUT') {
          pool.query(insert_bunker_query,[rollNo, status, at_time, on_date]);
      } else {
        pool.query(late_comers,[rollNo, status, at_time, on_date]);
        const result = await pool.query("select * from bunkers where bunkers.roll_no = $1 and on_date = $2",[rollNo, on_date]);
              if(result.rowCount){
                  pool.query(remove_bunker,[rollNo]);
              }
      }
      console.log("Insert student Successfully");
  } catch (e) {
      console.log(e);
  }
});

app.post('/insertVisitor', async (req, res) => {
  console.log('Inside insertVisitor');
  console.log(req.body);
  if (req.body.status == 'IN') {
      var {first_name, phone_no, reason_for_visiting, status, at_time, on_date} = req.body;
      let admission_no, rollNo;
      if (phone_no.length > 10) {
        phone_no = phone_no.substring(0,10);
      }
      const insert_entries_query = "INSERT into entries VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);";
      const insert_visiitor_query = "INSERT into visitors (visitor_no, first_name, phone_no, reason_for_visiting, time_in, on_date) VALUES($1, $2, $3, $4, $5, $6);";
      try {
        const result = await pool.query('select max(visitor_no) from visitors;');
        let visitor_no = result.rows[0].max;
        visitor_no += 1;
        // console.log(visitor_no);
          pool.query(insert_entries_query, [rollNo,status, at_time, on_date, visitor_no, phone_no, reason_for_visiting, admission_no, first_name]);
          pool.query(insert_visiitor_query, [visitor_no, first_name, phone_no, reason_for_visiting, at_time,on_date]);
          // var visitor_no = generateVisitorNo();
          console.log(visitor_no + " is the Visitor Number");
          console.log("Insert visitor Successfully");
          res.status(200);
          res.setHeader('Content-Type', 'text/plain');
          res.end(visitor_no.toString());
      } catch (e) {
          console.log(e);
      }
  } else {
    const {visitor_no, status, at_time, on_date} = req.body;
    const update_visitor = "UPDATE visitors SET time_out = $1 WHERE visitor_no = $2;";
    try {
      pool.query(update_visitor, [at_time, visitor_no]);
      console.log('update query Successful');
      res.status(200);
      res.setHeader('Content-Type', 'text/plain');
      res.end();
    } catch (e) {
      console.log(e);
    }
  }
});

// app.post('/insert', async (req, res) => {
//     const {rollNo, status, time, date} = req.body;
//     console.log(req.body);
//     const insert_entries_query = "INSERT into entries VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9);";
//     const insert_student_query = "INSERT into student VALUES($1, $2, $3, $4);";
//     const insert_bunker_query = "INSERT into bunkers VALUES($1, $2, $3, $4);";
//     const remove_bunker = "DELETE from bunkers WHERE roll_no = $1;";
//     const late_comers = "INSERT into late_comers VALUES($1, $2, $3, $4);";
//     try {
//       pool.query(insert_entries_query,[rollNo, status, time, date, visitor_no, phone_no, reason_for_visiting, admission_no, first_name]);
//       pool.query(insert_student_query,[rollNo, status, time, date]);
//       // res.send(status:200);
//     }
//     // try{
//     //     pool.query(insert_student_query,[rollNo, status, time, date]);
//     //     if(status === 'OUT'){
//     //       pool.query(insert_bunker_query,[rollNo, status, time, date]);
//     //     } else {
//     //       pool.query(late_comers,[rollNo, status, time, date]);
//     //       const result = await executeQuery("select * from bunkers where rollNo = $1",[rollNo]);
//     //       if(result.rowCount){
//     //           pool.query(remove_bunker,[rollNo]);
//     //       }
//     //     }
//     // }
//     catch(e){
//         console.log(e);
//     }
// });

function generateOTP() {
  var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

function SendOTP(email, otp) {

    const transporter = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            user : 'mohanprasath1999@gmail.com',
            pass : 'rrqemvaysrwocjko'
        }
    });

    var mailOptions = {
        from : 'mohanprasaths2021@srishakthi.ac.in',
        to : email,
        subject : 'OTP Verification',
        text : 'OTP for verification of your email is ' + otp + '\nThanks and Regards \n   SIET \nThis is an auto generated mail. Please dont reply to this mail.'
    };

    transporter.sendMail(mailOptions, function(err, info){
        if(err){
            console.log("Error occured");
            console.log(err);
        } else {
            console.log("Email Sent! " + info.response);
        }
    });
}
