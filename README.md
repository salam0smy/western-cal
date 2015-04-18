# Western-cal app

WesternCal is a clone of Angular-seed
for more information about Angular-seed
https://github.com/angular/angular-seed

## installation
- in /westernCalApp directory

 - install MongoDB
 	http://www.mongodb.org/downloads

 - install Node.js
 	http://nodejs.org/

 - install dependencies
 	npm install


 ## Running the application

 in terminal
 	start the database
 		mongod

 	run the server
 		node server.js

 	access the application in the browser via
 		http://localhost:8080/

 		to initialize the database visit -- only do this once to avoide duplicate data
 		http://localhost:8080/updatemap
 			user: ADMIN
 			pass: ADMIN321


 ## trouble shooting
 - if you run
 		npm install
	and have trouble running the server, manually install the dependecies
		npm install PCKG_NAME



## running Tests

-first install Karma
	sudo npm install -g karma

-start the script
	scripts/test.sh (on windows: scripts\test.bat)

- test configueration can be found in 
	config/karma.conf.js
