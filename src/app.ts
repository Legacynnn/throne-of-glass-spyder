import express, {Request, Response} from 'express'
import mysql from 'mysql'

const app = express()

const connectionString = "mysql://root:Folhas1234@localhost:3306/throne"
const connection = mysql.createConnection(connectionString)
connection.connect()

app.get('/api/characters', (req: Request, res: Response) => {
    const query = 'SELECT * FROM characters'
    connection.query(query, (err, rows) => {
        if (err) throw err;
        const retVal = {
            data: rows,
            message: rows.length === 0 ? 'No Records Found' : null
        }
        return res.send(retVal)
    })
})

app.get('/api/characters/:id', (req: Request, res: Response) => {
    const id = req.params.id
    const query = `SELECT * FROM characters WHERE ID = ${id} LIMIT 1`
    connection.query(query, (err, rows) => {
        if (err) throw err;
        const retVal = {
            data:rows.length > 0 ? rows[0] : null,
            message: rows.length === 0 ? 'No Record Found' : null
        }
        return res.send(retVal)
    })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log("App is running")
})