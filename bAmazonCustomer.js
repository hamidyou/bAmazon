const connection = require('./connection')
const { map, round } = require('kyanite/dist/kyanite')
const inquirer = require('inquirer')

const print = x => {
  console.log(`
  *********************************************

  ID: ${x.item_id}
  Product: ${x.product_name}
  Price: $${x.price}`)
}

const processOrder = (id, quantity) => {
  const sql = `UPDATE ?? SET stock_quantity = stock_quantity - ?, product_sales = product_sales + (price * ?) WHERE item_id = ?;`
  const inserts = [`products`, quantity, quantity, id]
  connection.query(sql, inserts, (err, res) => {
    if (err) throw err
    console.log(`Thank you for your order!
      `)
  })
}

const availability = (id, quantity) => {
  const sql = `SELECT stock_quantity, price FROM products WHERE item_id = ?`
  const inserts = `${id}`
  connection.query(sql, inserts, (err, res) => {
    if (err) throw err
    if (res[0].stock_quantity < quantity) {
      console.log(`Unfortunately, we do not have enough in stock to meet your order.`)
    } else {
      const total = round(2, quantity * res[0].price)
      processOrder(id, quantity)
      console.log(`\nYour total is $${total}. `)
    }
    connection.end(err => {
      if (err) throw err
    })
  })
}

const orderQuestions = () => {
  readProducts()
    .then(() => {
      inquirer
        .prompt([
          {
            type: `input`,
            name: `id`,
            message: `What is the ID of the product you wish to buy?`,
            validate: input => {
              const regex = /[0-9]/
              if (!regex.test(input)) {
                return `Please enter a valid item_id`
              }
              return true
            }
          },
          {
            type: `input`,
            name: `quantity`,
            message: `What is the quantity you would like to order?`,
            validate: input => {
              const regex = /[0-9]/
              if (!regex.test(input)) {
                return `Please enter a number.`
              } else {
                return true
              }
            }
          }
        ])
        .then(response => {
          availability(response.id, response.quantity)
        })
    })
}

const readProducts = () => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM products`, (err, res) => {
      if (err) reject(err)
      map(x => print(x), res)
      resolve()
    })
  })
}

orderQuestions()
