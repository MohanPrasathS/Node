CREATE TABLE public.visitors
(
    visitor_no serial primary key,
    first_name character varying(20),
    phone_no character varying(10),
    reason_for_visiting character varying(30),
    time_in character varying(10) ,
    time_out character varying(10),
    on_date character varying(12)
);
