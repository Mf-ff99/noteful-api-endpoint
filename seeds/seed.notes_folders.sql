TRUNCATE notes, folders RESTART IDENTITY CASCADE;

INSERT INTO folders (name)
VALUES
  ('Shopping'),
  ('TV'),
  ('Exercise'),
  ('Technology');

INSERT INTO notes (name, content, folder_id)
VALUES
  ('Groceries', 'This is a grocery list', 1),
  ('Favorite tech', 'printers and web apps!', 4);