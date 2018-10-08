begin transaction;
drop table if exists new_films;

create table new_films
  (
    id integer primary key,
    name varchar unique,
    watched date
  );

insert
  into new_films
  select *, null
  from films;

drop table films;

alter table new_films rename to films;
commit;
