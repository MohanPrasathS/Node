create table signin(
	username varchar(200) unique,
	name varchar(50),
	phone_no varchar(10),
	password varchar(200),
	otp varchar(4),
	verified boolean
);
