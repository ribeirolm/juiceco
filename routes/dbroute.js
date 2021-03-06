"use strict";

const express = require('express');
const router  = express.Router();


module.exports = (knex) => {

  // retrieve all preset drink information for display on the homepage
  router.get("/preset", (req, res) => {
      knex
      .select('*')
      .from("preset_drinks")
      .then((results) => {
      res.json(results);
    });  
  })

  // retreive all ingredient information for display on the homepage
  router.get("/ingredients", (req, res) => {    
    knex
    .select('*')
    .from("ingredients")
    .then((results) => {
    res.json(results);
  });  
})

  //retrieve all ingredients for "make your own" drink for display on the checkout page
  router.get("/checkout", async (req, res) => {
    
    let phoneNumber = req.body.phone_number
  
    const presetResults = await knex
      .select('orders.id as orderNum', 'orders.name as customerName','orders.phone_number as phoneNum', 'orders_lines.id as orderLineNum', 'preset_drinks.img as drinkImg', 'preset_drinks.name as presetDrinkName','orders.estimated_time as estimatedTime',
      knex.raw('ARRAY_AGG(ingredients.name) as ingredientName'))
      .from("orders_lines")
      .join("orders","orders_lines.order_id","orders.id")
      .join("preset_drinks", 'preset_drinks.id','orders_lines.preset_drink_id')
      .join('preset_ingredients', 'preset_ingredients.preset_drink_id', 'preset_drinks.id')
      .join("ingredients",'ingredients.id','preset_ingredients.ingredient_id')
      .groupBy('orderNum', 'customerName','phoneNum', 'orderLineNum', 'drinkImg','presetDrinkName' ,'estimatedTime')
      .where({'orders.id': knex.select('id').from('orders').where({phone_number: phoneNumber})})
      .whereNotNull('orders_lines.preset_drink_id').then()
   
    const customizedResults = await knex
      .select('orders.id as orderNum', 'orders_lines.id as orderLineNum','orders.name as customerName','orders.phone_number as phoneNum','orders.estimated_time as estimatedTime',
      knex.raw('ARRAY_AGG(ingredients.name) as igredientName'))
      .from("orders_lines")
      .join("orders","orders_lines.order_id","orders.id")
      .join("customized_drinks_ingredients", 'customized_drinks_ingredients.customized_drink_id','orders_lines.id')
      .join("ingredients",'ingredients.id','customized_drinks_ingredients.ingredient_id')
      .groupBy('orderNum', 'orderLineNum','customerName','phoneNum', 'estimatedTime')
      .where({'orders.id': knex.select('id').from('orders').where({phone_number: phoneNumber})})
      .whereNull('orders_lines.preset_drink_id').then()

      res.json(presetResults.concat(customizedResults))
  })

  //retrieve orders with no finished time for display on the order queue in the business page
  //need to join with users table to pull the users name and phone number to display within the order
  
  router.get("/business", async (req, res) => {
    
    const presetResults = await knex
      .select('orders.id as orderNum', 'orders_lines.id as orderLineNum','orders.name as customerName','orders.phone_number as phoneNum', 'preset_drinks.img as drinkImg', 'preset_drinks.name as presetDrinkName','orders.estimated_time as estimatedTime',
      knex.raw('ARRAY_AGG(ingredients.name) as ingredientName'))
      .from("orders_lines")
      .join("orders","orders_lines.order_id","orders.id")
      .join("preset_drinks", 'preset_drinks.id','orders_lines.preset_drink_id')
      .join('preset_ingredients', 'preset_ingredients.preset_drink_id', 'preset_drinks.id')
      .join("ingredients",'ingredients.id','preset_ingredients.ingredient_id')
      .groupBy('orderNum', 'orderLineNum','customerName','phoneNum', 'drinkImg','presetDrinkName','estimatedTime')
      .where({'orders.status': 'outstanding'})
      .whereNotNull('orders_lines.preset_drink_id').then()
   
    const customizedResults = await knex
      .select('orders.id as orderNum', 'orders_lines.id as orderLineNum','orders.name as customerName','orders.phone_number as phoneNum','orders.estimated_time as estimatedTime',
      knex.raw('ARRAY_AGG(ingredients.name) as ingredientName'))
      .from("orders_lines")
      .join("orders","orders_lines.order_id","orders.id")
      .join("customized_drinks_ingredients", 'customized_drinks_ingredients.customized_drink_id','orders_lines.id')
      .join("ingredients",'ingredients.id','customized_drinks_ingredients.ingredient_id')
      .groupBy('orderNum', 'orderLineNum','customerName','phoneNum', 'estimatedTime')
      .where({'orders.status': 'outstanding'})
      .whereNull('orders_lines.preset_drink_id').then()

      res.json(presetResults.concat(customizedResults))
 
  })

  return router;

}