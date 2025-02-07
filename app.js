const express = require('express')
const path = require("path")
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

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

