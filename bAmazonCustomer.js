const connection = require('./connection')
const { map, round } = require('kyanite/dist/kyanite')
const inquirer = require('inquirer')

const printProduct = x => {
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
  inquirer
    .prompt([
      {
        type: `input`,
        name: `id`,
        message: `What is the ID of the product you wish to buy?`,
        filter: input => {
          const regex = /[0-9]/
          if (!regex.test(input)) {
            console.log(`
            Please enter a valid item_id`)
          }
          return input
        }
      },
      {
        type: `input`,
        name: `quantity`,
        message: `What is the quantity you would like to order?`,
        filter: input => {
          const regex = /[0-9]/
          if (!regex.test(input)) {
            console.log(`Please enter a number.`)
          } else {
            return input
          }
        }
      }
    ])
    .then(response => {
      availability(response.id, response.quantity)
    })
}

const readProducts = () => {
  connection.query(
    `SELECT * FROM products`,
    function (err, res) {
      if (err) throw err
      map(x => printProduct(x), res)
      connection.end(err => {
        if (err) throw err
      })
    }
  )
}

orderQuestions()

module.exports = printProduct
