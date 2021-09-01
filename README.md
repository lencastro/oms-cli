# Order Management Service

_This is portable CLI for calling REST based API and perform GET / POST operation after user authentication_

# Prerequisites

* node v12.8.0
* npm 6.10.2
* git 

# Installation

## In Command Prompt / Terminal (1)


> npm i

## In Command Prompt / Terminal (2)

Go into the backend directory :

> npm i
> >
> npm start


## Unit testing

> npm test

_To run the unit test cases_

> npm test:report

_To run the unit test cases with coverage report_

> npm test:cover

_To run the test cases with coverage report in HTML inside __coverage__ folder_


# After Installation

## In Command Prompt / Terminal (1)

> npm link
>
> oms

_It should work or try <npm link --force>_

# Command Usage

## Login

> oms login -user `<username>` -password `<password>` -a `<authurl>`
> 
> output > Session Info written to file

_After execution, you could find the session.json file in context folder_

Use below values

*`<usrname>` - test@email.com*

*`<password>` - testpwd*

*`<authurl>` - http://localhost:8080/login*

Example :

>_oms login -user test@email.com -password testpwd -a "http://localhost:8080/login"_

## Orders

> oms get orders
>
> output > `[ ...list of orders]`

_After execution, you could see all the orders from orders.json file which is present inside the backend/db folder_


> oms get orders `<orderId>`
> 
> output > `[order]`

*`<orderId>` - [optional] orderId to search*

_After execution, you could see the specific order from orders.json file which is present inside the backend/db folder_

Example :

> oms get orders
>
> oms get orders 11

## Create

> oms create orders --json `<JSON String>`

_After execution, specific order updated/added in orders.json file which is present inside the backend/db folder_

Example :
> oms create orders -json '{\"orderId\":14, \"name\":\"headphone\", \"productId\":\"A002\", \"count\":1}'

