import sqlite3
def insert(value):

    conn.execute("INSERT INTO ISSUE (MSG) \
      VALUES (?)", (value,));
    print("Records created successfully")  

def show():
    cursor = conn.execute("SELECT MSG from ISSUE")
    for row in cursor:
        print("MSG = "+row[0])
        
conn = sqlite3.connect('issue.db')

print("Opened database successfully")

""" conn.execute('''CREATE TABLE ISSUE
         (
         MSG           char(200)    NOT NULL
         );''') """ 
insert("el7")
insert("isa")
insert("yarab yarab")
show()
print("Table created successfully")

conn.close()       