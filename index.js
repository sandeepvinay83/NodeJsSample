const express  = require('express')
const fs = require('fs')
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get('/', (request, response) => {
    return response.send('Hello World!')
})

app.get('/todos', (request, response) => {
    const showPending = request.query.showpending
    fs.readFile('./store/todos.json','utf-8', (error,data) => {
        if (error) {
            return response.status(500).send('Sorry, something went wrong')
        }
        const todos = JSON.parse(data)
        if (showPending !== "1") {
            return response.json({todos: todos})
        } else {
            return response.json({todos: todos.filter(t => { return t.complete === false })})
        }
    })
})

app.put('/todos/:id/complete', (request,response) => {
    const id = request.params.id
    const findTodoIndex = (todos,id) => {
        for(let i = 0; i < todos.length; i++) {
            if (todos[i].id === parseInt(id)) {
                return i
            }
        }
        return -1
    }
    fs.readFile('./store/todos.json','utf-8',(error,data) => {
        if (error) {
            return response.status(500).json({'status':500})
            // return response.status(500).send('Sorry, something went wrong')
        }
        let todos = JSON.parse(data)
        const todoIndex = findTodoIndex(todos,id)
        if (todoIndex === -1) {
            return response.status(404).json({'status':404})
            // return response.status(404).send('Sorry, index not found')
        }
        todos[todoIndex].complete = true
        fs.writeFile('./store/todos.json',JSON.stringify(todos), () => {
            return response.json({'status':'success'})
        })
    })
})

app.post('/todo', (request,response) => {
    if (!request.body.name) {
        return response.status(400).json({'status':'Couldn\'t find name in body'})
    }
    fs.readFile('./store/todos.json','utf-8',(error,data) => {
        if (error) {
            return response.status(500).json({'status':500})
        }
        const todos = JSON.parse(data)
        const maxId = Math.max.apply(Math,todos.map(t => {return t.id}))
        todos.push({
            id: maxId + 1,
            complete: false,
            name: request.body.name
        })
        fs.writeFile('./store/todos.json',JSON.stringify(todos),(error) => {
            if (error) {
                return response.status(404).json({'status':'Error updating the db'})
            }
            return response.json({'status':'success'})
        })
    })
})

app.post('/todo/delete', (request,response) => {
    if (!request.body.name) {
        return response.status(400).json({'status':'Couldn\'t find name in body'})
    }
    fs.readFile('./store/todos.json','utf-8',(error,data) => {
        if (error) {
            return response.status(500).json({'status':500})
        }
        const todos = JSON.parse(data)
        const deleteIndex = todos.map(t => {return t.name}).indexOf(request.body.name)
        if (deleteIndex > -1) {
            todos.splice(deleteIndex,1)
            fs.writeFile('./store/todos.json',JSON.stringify(todos),(error) => {
                if (error) {
                    return response.status(404).json({'status':'Error updating the db'})
                }
                return response.json({'status':'success'})
            })
        } else {
            return response.status(400).json({'status':'Didn\'t find item to delete'})
        }
    })
})

app.listen(3000, () => {
    console.log("Application running on http://localhost:3000")
})