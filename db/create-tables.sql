create table if not exists users
  (
    username text unique,
    password text
  );

  create table if not exists films
    (
      id integer primary key,
      name varchar unique
    );

create table if not exists collections
  (
    id integer primary key,
    name varchar unique
  );

  create table if not exists collection_films
    (
      collection_id integer,
      film_id integer
    );
