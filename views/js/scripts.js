/*!
    * Start Bootstrap - SB Admin v6.0.2 (https://startbootstrap.com/template/sb-admin)
    * Copyright 2013-2020 Start Bootstrap
    * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-sb-admin/blob/master/LICENSE)
    */
    (function($) {
    "use strict";

    // Add active state to sidbar nav links
    var path = window.location.href; // because the 'href' property of the DOM element is the absolute path
        $("#layoutSidenav_nav .sb-sidenav a.nav-link").each(function() {
            if (this.href === path) {
                $(this).addClass("active");
            }
        });

    // Toggle the side navigation
    $("#sidebarToggle").on("click", function(e) {
        e.preventDefault();
        $("body").toggleClass("sb-sidenav-toggled");
    });
})(jQuery);

// Change the page main content based on the requests
function changePageContent(route){
  console.log(route);
  var xhttp = new XMLHttpRequest();
  var res;
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // console.log(this.responseText);
      res = this.responseText;
      console.log(res);
      document.getElementById('container-fluid').innerHTML = this.responseText;
      console.log(this.responseText);
    }
  };
  // document.getElementById('test-content').innerHTML = res;
  xhttp.open("GET", route, true);
  xhttp.send();
}

// Generate the PDF of the table present in the screen
function generatePDF() {
    var pdf = new jsPDF('p', 'pt', 'letter');
    // source can be HTML-formatted string, or a reference
    // to an actual DOM element from which the text will be scraped.
    source = $('#content')[0];

    // we support special element handlers. Register them with jQuery-style
    // ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
    // There is no support for any other type of selectors
    // (class, of compound) at this time.
    specialElementHandlers = {
        // element with id of "bypass" - jQuery style selector
        '#bypassme': function (element, renderer) {
            // true = "handled elsewhere, bypass text extraction"
            return true
        }
    };
    margins = {
        top: 80,
        bottom: 60,
        left: 10,
        width: 700
    };
    // all coords and widths are in jsPDF instance's declared units
    // 'inches' in this case
    pdf.fromHTML(
    source, // HTML string or DOM elem ref.
    margins.left, // x coord
    margins.top, { // y coord
        'width': margins.width, // max width of content on PDF
        'elementHandlers': specialElementHandlers
    },

    function (dispose) {
        // dispose: object with X, Y of the last line add to the PDF
        //          this allow the insertion of new lines after html
        pdf.save('Test.pdf');
    }, margins);
}

// Conformation before Logout
function confirm_logout() {
      var txt;
      var r = confirm("Are you sure want to Logout?");
      if (r == true) {
        window.location.assign ("index.html");
      } else {
        window.location.href = "#";
      }
}

// General select
function Select(){
    fetch('./select').then(function(response) {
        response.json().then(function(data) {
               document.getElementById('content').innerHTML = makeEntriesTable(data);
        });
    });
}

function makeEntriesTable(data) {
  var output = "";
  output += '<table class="table table-hover table-bordered caption-top" id="select_records" style="border: 2px solid black; padding:10px; border-collapse: separate;">';
  output += '<caption style="caption-side: top-outside; color : blue; fontstyle: bold"><i>';
  output += 'List of Entries';
  output += '</i></caption> <tr style="background-color:grey; color: white"> <th>Roll_No</th> <th>Status</th> <th>Time</th> <th>Date</th> <th>Visitor_No</th> <th>Phone_No</th> <th>Reason</th> <th>Admission_No</th> <th>Name</th></tr>';
  for (x in data){
      output += '<tr> <td style="border: 1px solid black;">' + data[x].roll_no + '</td> <td style="border: 1px solid black;">' + data[x].status + '</td> <td style="border: 1px solid black;">' + data[x].at_time + '</td> <td style="border: 1px solid black;">' + data[x].on_date + '</td> <td style="border: 1px solid black;">' + data[x].visitor_no + '</td> <td style="border: 1px solid black;">' + data[x].phone_no + '</td> <td style="border: 1px solid black;">' + data[x].reason_for_visiting + '</td> <td style="border: 1px solid black;">' + data[x].admission_no + '</td> <td style="border: 1px solid black;">' + data[x].first_name + '</td> </tr>';
  }
  output += '</table>';
  return output;
}

function makeTable(data){
    var output = "";
    output += '<table class="table table-hover table-bordered caption-top" id="select_records" style="border: 2px solid black; padding:10px; border-collapse: separate;">';
    output += '<caption style="caption-side: top-outside; color : blue; fontstyle: bold"><i>';
    output += 'List of Entries';
    output += '</i></caption> <tr style="background-color:grey; color: white"> <th>Roll_No</th> <th>Status</th> <th>Time</th> <th>Date</th> </tr>';
    for (x in data){
        output += '<tr> <td style="border: 1px solid black;">' + data[x].roll_no + '</td> <td style="border: 1px solid black;">' + data[x].status + '</td> <td style="border: 1px solid black;">' + data[x].at_time + '</td> <td style="border: 1px solid black;">' + data[x].on_date + '</td> </tr>';
    }
    output += '</table>';
    return output;
}

// select earlyMorning late_comers
function SelectMorning(){
    fetch('./inMorning').then(function(response) {
        response.json().then(function(data) {
               document.getElementById('content').innerHTML = makeTable(data);
        });
    });
}

// Select afterLunch
function SelectLunch(){
    fetch('./afterLunch').then(function(response) {
        response.json().then(function(data) {
               document.getElementById('content').innerHTML = makeTable(data);
        });
    });
}

// fetch visitor Table
function selectVisitor(){
    fetch('./selectVisitor').then(function(response) {
        response.json().then(function(data) {
               document.getElementById('content').innerHTML = makeVisitorTable(data);
        });
    });
}

// make visitor Table
function makeVisitorTable(data){
    var output = "";
    output += '<table class="table table-hover table-bordered caption-top" id="select_records" style="border: 2px solid black; padding:10px; border-collapse: separate;">';
    output += '<caption style="caption-side: top-outside; color : blue; fontstyle: bold"><i>';
    output += 'List of Visitors';
    output += '</i></caption> <tr style="background-color:grey; color: white"> <th>Visitor_No</th> <th>Name</th> <th>Phone_No</th> <th>Reason</th> <th>Time_In</th> <th>Time_Out</th> <th>Date</th> </tr>';
    for (x in data){
        output += '<tr> <td style="border: 1px solid black;">' + data[x].visitor_no + '</td> <td style="border: 1px solid black;">' + data[x].first_name + '</td> <td style="border: 1px solid black;">' + data[x].phone_no + '</td> <td style="border: 1px solid black;">' + data[x].reason_for_visiting + '</td> <td style="border: 1px solid black;">' + data[x].time_in + '</td> <td style="border: 1px solid black;">' + data[x].time_out + '</td> <td style="border: 1px solid black;">' + data[x].on_date + '</td>  </tr>';
    }
    output += '</table>';
    return output;
}


// select bunkers
function selectBunker(){
    fetch('./bunked_people').then(function(response) {
        response.json().then(function(data) {
               document.getElementById('content').innerHTML = makeTable(data);
        });
    });
}

function validatePhone() {
  console.log('inside isValid_phoneNo');
  var phone = document.getElementById('admission_phone').value;
  console.log(phone);
  if((phone).length == 10){
    select_admission_id();
    // document.getElementById('phone_button').disabled = false;
  }
}

function select_admission_id() {
  const data = {
    phone_no : document.getElementById('admission_phone').value,
  }
  console.log(data);
  fetch('./enquiry_number', {
      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(function(response) {
      response.json().then(function(data) {
        console.log(data);
        console.log(data[0].student_first_name);
        if (data[0].student_first_name !== '') {
             document.getElementById('admission_no').value =(data[0].admission_no);
             document.getElementById('student_first_name').value =(data[0].student_fn);
             document.getElementById('student_last_name').value =(data[0].student_ln);
             document.getElementById('father_first_name').value =(data[0].father_fn);
             document.getElementById('father_last_name').value =(data[0].father_ln);
             document.getElementById('mother_first_name').value =(data[0].mother_fn);
             document.getElementById('mother_last_name').value =(data[0].mother_ln);
             document.getElementById('email').value =(data[0].email);
             document.getElementById('DOB').value =(data[0].dob);
             document.getElementById('address').value =(data[0].address);
             document.getElementById('city').value =(data[0].city);
             document.getElementById('state').value =(data[0].state);
             document.getElementById('zip').value =(data[0].zip);
             document.getElementById('parent_mobile_number_1').value =(data[0].parent_mob_1);
             document.getElementById('parent_mobile_number_2').value =(data[0].parent_mob_2);
             document.getElementById('course_1').value =(data[0].course_1);
             document.getElementById('course_2').value =(data[0].course_2);
             document.getElementById('school').value =(data[0].school);
             document.getElementById('x_marks').value =(data[0].x_marks);
             document.getElementById('xii_marks').value =(data[0].xii_marks);
             document.getElementById('cutoff_marks').value =(data[0].cut_off);
        } else {
          document.getElementById('student_first_name').value ='';
          document.getElementById('student_last_name').value ='';
          document.getElementById('father_first_name').value ='';
          document.getElementById('father_last_name').value ='';
          document.getElementById('mother_first_name').value ='';
          document.getElementById('mother_last_name').value ='';
          document.getElementById('email').value ='';
          document.getElementById('DOB').value ='';
          document.getElementById('address').value ='';
          document.getElementById('city').value ='';
          document.getElementById('state').value ='';
          document.getElementById('zip').value ='';
          document.getElementById('parent_mobile_number_1').value ='';
          document.getElementById('parent_mobile_number_2').value ='';
          document.getElementById('course_1').value ='';
          document.getElementById('course_2').value ='';
          document.getElementById('school').value ='';
          document.getElementById('x_marks').value ='';
          document.getElementById('xii_marks').value ='';
          document.getElementById('cutoff_marks').value ='';
        }

      });
  });
}
