const express = require('express')
const path = require("path")
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const {format,isValid} = require('date-fns')
// const isValid = require('date-fns/isValid')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname,"todoApplication.db")

let db = null
const initializeDbAndServer = async() =>{
    try{
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })
        app.listen(3000,()=>{
            console.log("server is running at port 3000")
        })
    }catch(e){
        console.log(`Error:${e}`)
        process.exit(1)
    }
}

initializeDbAndServer()

    // "id": 3,
    // "task_name": "Clean the garden",
    // "priority": "LOW",
    // "status": "TO DO",
    // "category": "HOME",
    // "task_date": "2021-02-22"

// API 1

app.get('/todo/' , async (request,response) => {
    const {priority,status,search_q} = request.query
    // const statusQuery = `
    // SELECT * FROM todo WHERE (id,task_name,priority,status,category,task_date) = (?,?,?,?,?,?);
    // `
    let statusQuery = `
    SELECT * FROM todo WHERE 1=1
    `;
    const params = []

    if(status){
        statusQuery += " AND status = ?";
        params.push(status)
    }

    if(priority){
        statusQuery += " AND priority = ?";
        params.push(priority)
    }

    if(search_q){
        statusQuery += " AND task_name LIKE ?";
        params.push(`%${search_q}%`)
    }


    try {
        console.log("SQL Query:", statusQuery);
        console.log("Parameters:", params);
        const statusSelect = await db.all(statusQuery, params);
        response.send(statusSelect);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        response.status(500).send({ error: "Internal Server Error" });
    }

});

// API 2

app.get('/todo/:id',async(request,response)=>{

    const {id} = request.params;

    const searchQuery = `
    SELECT * FROM todo WHERE id=?
    `;

    try{
        const searchResult = await db.get(searchQuery,[id]);
        response.send(searchResult)
    }catch(e){
        console.log(`ERROR is :${e}`)
    }
})


// API 3

app.get('/agenda/',async(request,response)=>{
    const {date} = request.query
    if(!date){
        return response.status(400).send({error:"please provide a valid date parameter"});
    }

    const parsedDate = parseISO(date);
    console.log(parsedDate);

    if(!isValid(parsedDate)){
        return response.status(400).send({error:"Invalid date format.Use YYYY-MM-DD."})
    }

    const formattedDate = format(parsedDate,'yyyy-MM-dd')

    const searchQuery = `SELECT * FROM todo WHERE task_date=?`;

    try{
        const searchResult = await db.all(searchQuery,[formattedDate])
        response.send(searchResult)
    }catch(e){
        response.send(`ERROR:${e}`)
    }
})