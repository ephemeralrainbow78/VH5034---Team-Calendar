import sqlite3

conn = sqlite3.connect("database.db")

with open("C:\\Users\\might\\VH5034---Team-Calendar\\backend\\app\\schema.sql", "r") as file:
    conn.executescript(file.read())

conn.commit()
conn.close()

print("Database created successfully!")