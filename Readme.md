# iHRM Repository Information



## Other Documentation in this Repository

* [Frontend](frontend/Readme.md)
* [Backend](backend/Readme.md)

## Build, Test and Deployment Information

Clone the repo from [http://hg-tn/ihrm](http://hg-tn/ihrm) into ``/work/devel/ihrm``.
```bash
/work/devel> hg clone http://hg-tn/ihrm
```

### Requirements

In order to build and run the backend, you should have installed on your system:

* [sbt](https://www.scala-sbt.org/download.html)
* [java 11](https://openjdk.java.net/install/)

### Build and Run the Backend (Akka-Http web server)

In order to run the backend server run the following commands:
```bash
/work/devel/ihrm> cd backend
/work/devel/ihrm/backend> sbt run 
```
When starting the server it will check if a H2 data base is available under the defult path ``/data/ihrm/database``.
This path can be changed in the config file under ``/work/devel/ihrm/backend/src/main/resources/application.conf``.

The first time you run the backend server, the data base schema will be created and a super admin with the following credentials will be created:

* login = super-admin
* password = admin

If you want to fill the database with some test data you can run the default datastock:
```bash
/work/devel/ihrm> cd backend
/work/devel/ihrm/backend> sbt
sbt> test:runMain datastock.DefaultDataStock
```
This will create 2 workspaces "imbus" and "diligate" that have each the following users:

* "admin"/"admin" with the global role Administrator
* "manager"/"manager" with the global role AccountManager
* "lead/lead", "supervisor"/"supervisor" and "member"/"member" without global roles.

Each workspace has then 4 customers "Customer N° <1 .. 4>".
Each Customer has 3 projects "Project A", "Project B" and "Project C" with the corresponding members.

For more details see ``/work/devel/ihrm/backend/src/test/scala/datastock/DefaultDataStock.scala``.

### Try the Rest calls using the Swagger-UI

After starting the backend server, you can use the swagger-ui to execute the defined rest calls by opening the file ``file:///work/devel/ihrm/swagger-ui/dist/index.html``

