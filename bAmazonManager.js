const connection = require('./connection')
const { map } = require('kyanite/dist/kyanite')
const inquirer = require('inquirer')

const print = x => {
  console.log(`
  *********************************************

  ID: ${x.item_id}
  Product: ${x.product_name}
  Price: $${x.price}
  Quantity: ${x.stock_quantity}`)
}

const view = () => {
  const sql = `SELECT * FROM ??`
  const inserts = `products`
  connection.query(sql, inserts, (err, res) => {
    if (err) throw err
    map(x => print(x), res)
    connection.end(err => {
      if (err) throw err
    })
  })
}

const low = () => {
  const sql = `SELECT * FROM ?? WHERE ?? < ? `
  const inserts = [`products`, `stock_quantity`, 5]
  connection.query(sql, inserts, (err, res) => {
    if (err) throw err
    map(x => print(x), res)
    connection.end(err => {
      if (err) throw err
    })
  })
}

const updateQuery = (id, quantity) => {
  const sql = `UPDATE ?? SET ?? = ?? + ? WHERE ?? = ?`
  const inserts = [`products`, `stock_quantity`, `stock_quantity`, quantity, `item_id`, id]
  connection.query(sql, inserts, (err, res) => {
    if (err) throw err
    console.log(`${quantity} units successfully added to item #${id}.`)
    connection.end(err => {
      if (err) throw err
    })
  })
}

const update = () => {
  inquirer
    .prompt([
      {
        type: `input`,
        name: `id`,
        message: `What is the ID of the product you wish to add to?`,
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
        message: `What is the quantity you would like to add?`,
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
      updateQuery(response.id, response.quantity)
    })
}

const addQuery = (name, dept, price, quantity) => {
  let sql = `INSERT INTO ?? (product_name, department, price, stock_quantity) VALUES (?,?,?,?)`
  const inserts = [`products`, `${name}`, `${dept}`, `${price}`, `${quantity}`]
  connection.query(sql, inserts, (err, res) => {
    if (err) throw err
    console.log(`${name} added successfully to the inventory.`)
    connection.end(err => {
      if (err) throw err
    })
  })
}

const addNew = () => {
  inquirer
    .prompt([
      {
        type: `input`,
        name: `name`,
        message: `What is the name of the product you wish to add to the inventory?`
      },
      {
        type: `input`,
        name: `quantity`,
        message: `What is the quantity you would like to add?`,
        validate: input => {
          const regex = /[0-9]/
          if (!regex.test(input)) {
            return `Please enter a number.`
          } else {
            return true
          }
        }
      },
      {
        type: `input`,
        name: `department`,
        message: `What department does this product belong to?`
      },
      {
        type: `input`,
        name: `price`,
        message: `What is the price for one unit of this item?`,
        validate: input => {
          const regex = /[0-9].+/
          if (!regex.test(input)) {
            return `Please enter a valid amount.`
          } else {
            return true
          }
        }
      }
    ])
    .then(response => {
      addQuery(response.name, response.department, response.price, response.quantity)
    })
}

const menu = () => {
  inquirer
    .prompt([
      {
        type: `rawlist`,
        name: `menu`,
        choices: [`View Products for Sale`, `View Low Inventory`, `Add to Inventory`, `Add New Product`],
        message: `Please make your selection.`
      }
    ])
    .then(response => {
      if (response.menu === `View Products for Sale`) {
        view()
      } else if (response.menu === `View Low Inventory`) {
        low()
      } else if (response.menu === `Add to Inventory`) {
        update()
      } else if (response.menu === `Add New Product`) {
        addNew()
      }
    })
}

menu()
