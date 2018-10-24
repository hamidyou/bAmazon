const connection = require('./connection')
const { map } = require('kyanite/dist/kyanite')
const inquirer = require('inquirer')

const print = x => {
  console.log(`
  *********************************************

  Department: ${x.department_name}
  Over Head: $${x.over_head_costs}
  Total Sales: $${x.sum}
  Total Profit: $${x.total_profit}`)
}

const viewSalesByDept = () => {
  const sql = `
  SELECT d.*, SUM(p.product_sales) as sum, (p.product_sales-d.over_head_costs) as total_profit
FROM departments d
LEFT JOIN products p
ON d.department_name=p.department
GROUP BY d.department_name`
  connection.query(sql, (err, res) => {
    if (err) throw err
    map(x => print(x), res)
    connection.end(err => {
      if (err) throw err
    })
  })
}

const addDeptQuery = (dept, overHead) => {
  const sql = `INSERT INTO departments (department_name, over_head_costs) VALUES (?, ?)`
  const inserts = [dept, overHead]
  connection.query(sql, inserts, (err, res) => {
    if (err) throw err
    console.log(`${dept} added successfully.`)
    connection.end(err => {
      if (err) throw err
    })
  })
}

const addDept = () => {
  inquirer
    .prompt([
      {
        type: `input`,
        name: `department`,
        message: `What is the name of the department you wish to add?`
      },
      {
        type: `input`,
        name: `overHead`,
        message: `What are the overhead costs for this department?`,
        validate: input => {
          const regex = /[^0-9]/g
          if (regex.test(input)) {
            return `Please enter a number.`
          } else {
            return true
          }
        }
      }
    ])
    .then(response => {
      addDeptQuery(response.department, response.overHead)
    })
}

const menu = () => {
  inquirer
    .prompt([
      {
        type: `rawlist`,
        name: `choice`,
        choices: [`View Product Sales by Department`, `Create New Department`]
      }
    ])
    .then(response => {
      if (response.choice === `View Product Sales by Department`) {
        viewSalesByDept()
      } else if (response.choice === `Create New Department`) {
        addDept()
      }
    })
}

menu()
