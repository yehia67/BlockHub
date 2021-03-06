import sqlite3
def createIssue(issueName):
    conn.execute('''CREATE TABLE {tableName}
         (
         MSG           char(200)    NOT NULL
         );'''.\
        format(tableName=issueName))
    print(" Table created successfully")  

def insert(issueName,value):
    conn.execute("INSERT INTO {tableName} (MSG) \
      VALUES (?)".\
        format(tableName=issueName),(value,))
    print("Records created successfully")  

def show(issueName):
    cursor = conn.execute("SELECT MSG from  {tableName}".\
        format(tableName=issueName))
    for row in cursor:
        print("MSG = "+row[0])

     
conn = sqlite3.connect('issue.db')
print("Opened database successfully")



conn.close()       