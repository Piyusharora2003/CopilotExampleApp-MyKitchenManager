"use client";

import { FoodItemContainer } from "@/components/foodItem";
import { nanoid } from "nanoid";
import React, { useState, useEffect } from 'react';
import { foodItem } from "../types/foodItems";
import {
  CopilotKit,
  useCopilotAction,
  useMakeCopilotReadable,
} from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import axios from "axios";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DatePicker } from "@/components/ui/datepicker";
import Recipies from "@/components/RecipiesContainer";

async function getIcon(port: number, name: string) {
  const url = `http://localhost:${port}/?item=${name}`;
  const response = await axios.get(url);
  return response.data;
}

export default function Home() {
  
  return (
    <div className="">
      <CopilotKit url="/api/copilotkit/">
        <TodoList />
        <CopilotPopup
          instructions={
            "Help the user manage his food items and may help him in making something to eat ."
          }
          defaultOpen={true}
          labels={{
            title: "Kitchen Helper",
            initial: "Hi you! 👋 I can help you manage your food needs. But First please add what all you have in kitchen right now ",
          }}
          clickOutsideToClose={false}
        />
      </CopilotKit>
    </div>
  );
}

const TodoList: React.FC = () => {
  const [foodItems, setFoodItems] = useState<foodItem[]>([]);
  const [input, setInput] = useState<foodItem>({
    id: "ids",
    fname: "",
    quantity: "Good",
    dateOfExpiry: new Date()
  });

  useMakeCopilotReadable(
    "This is the user's todo list: " + JSON.stringify(foodItems)
  );

  useCopilotAction({
    name: "updateTodoList",
    description: "Update the users todo list",
    parameters: [
      {
        name: "items",
        type: "object[]",
        description: "The new and updated todo list items.",
        attributes: [
          {
            name: "id",
            type: "string",
            required: true,
            description:
              "The id of the food item. When creating a new food item, just make up a new id.",
          },
          {
            name: "fname",
            type: "string",
            description: "The name of the Food item.",
            required: true,
          },
          {
            name: "dateOfExpiry",
            type: "string",
            description: "The Date of expiry of the food item. (Optional) try to utilize the close to expiry food items first , if already expired then dont use it and prompt user to throw it .",
          },
          {
            name: "quantity",
            type: "string",
            description:
              "The Quantity of the food item it can be be in kgs, gms , ml etc.",
          },
          {
            name: "icon",
            type: "string",
            description: "The icon of the food item. to get this use the geticon function and pass the parameters: (8080,fname of the food)",
          }
        ],
      },
    ],
    handler: async ({ items }) => {
      // console.log(items);
      const newItemList = [...foodItems];
      for (const item of items) {
        const existingItemIndex = newItemList.findIndex(
          (elem) => elem.id === item.id
        );
        // console.log(item);
        item['icon'] = await getIcon(8080,item.fname);
        if (item["dateOfExpiry"]){
          item["dateOfExpiry"] = new Date(item["dateOfExpiry"]);
        } 
        if (existingItemIndex !== -1) {
          newItemList[existingItemIndex] = item;
        } else {
          newItemList.push(item);
        }
      }
      setFoodItems(newItemList);
    },
    render: "Updating the todo list...",
  });

  useCopilotAction({
    name: "DeleteItem",
    description: "remove a food item from inventory",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "The id of the todo item to delete.",
      },
      {
        name: "fname",
        type: "string",
        description: "The name of the food item to delete."
      }
    ],
    handler: ({ id }) => {
      setFoodItems(foodItems.filter((item) => item.id !== id));
    },
    render: "Throwing the food away...",
  });



  const bringTheFood = async () => {
    const icon = await getIcon(8080,input["fname"].trim()); 
    // need to add adjustable doe and quantity options
    if (input["fname"].trim() !== "") {
      const newItem: foodItem = {
        id: nanoid(),
        fname: input["fname"].trim(),
        quantity: input["quantity"],
        icon: icon,
        dateOfExpiry: input["dateOfExpiry"]
      };
      if( Object.keys(input).includes("dateOfExpiry")){
        // console.log("dateOfExpiry : ",input["dateOfExpiry"]);
        
        newItem.dateOfExpiry = input["dateOfExpiry"];
      }
      // console.log("newItem : ",newItem);
      
      setFoodItems([...foodItems, newItem]);
    
      setInput({
        id: "",
        fname: "",
        quantity: "Good",
        dateOfExpiry: new Date(),
      }); // Reset input field
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      bringTheFood();
    }
  };


  const removeFood = (id: string) => {
    console.log("Before deleting : ",foodItems);
    setFoodItems(foodItems.filter((todo) => todo.id !== id));
    console.log("After Deleting : ",foodItems);
  };

  function setDate(date: Date){
    let newer = { ...input };
    newer["dateOfExpiry"] = date;
    setInput(newer)
  }

  function closetheDialog(){
    document.getElementById("addToInventory")?.click();
  }

  return (
    <div className="flex w-screen h-screen">
      <div className="border-1 border w-1/5 bg-neutral-200 text-center font-bold text-xl	">
        {/* My store */}
        <h1 className="capitalize	pt-3 pb-3">Inventory</h1>
        {/* Add To List Button */}
        <Popover >
          <PopoverTrigger >
            <div className="bg-blue-500 rounded-md p-2.5 w-max button text-black m-auto flex" id="addToInventory" onClick={bringTheFood}>Add item
              <img src={"https://cdn4.iconfinder.com/data/icons/glyphs/24/icons_add-64.png"} className="w-5 h-5 p m-auto mx-2 float-start" />
            </div>
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-col ">
              <input
                className="border rounded-md p-2 flex-1 mr-2 mb-3"
                value={input["fname"]}
                type="text"
                onChange={(e) => {
                  let newer = { ...input };
                  newer["fname"] = e.target.value;
                  setInput(newer)
                }}
                placeholder="Enter the food item *"
                onKeyDown={(e) => handleKeyPress(e)} // Add this to handle the Enter key press
              /> 
              <div className="flex justify-around	 w-full items-center mb-3">
                <label className="font-light text-gray-600 text-center" htmlFor="quantity">Quantity :</label>
                <select 
                  className="font-light text-gray-600 text-sm	border-2 border rounded-md mr-2 p-2"
                  value={input["quantity"]}  
                  name="quantity"   
                  onChange={(e) => {
                    let newer = { ...input };
                    newer["quantity"] = e.target.value;
                    setInput(newer)
                  }}      
                >
                  <option value="Good">Good</option>
                  <option value="Low">Low</option>
                  <option value="Excess">Excess</option>
                </select> 
              </div>     
              <div className="flex justify-around	 w-full items-center">
                <label className="font-light text-gray-600 text-center" htmlFor="DOE">Date Of Expiry :</label>
                <DatePicker date = {input["dateOfExpiry"]} setDate={setDate}/>
              </div>
            </div>
            <div onClick={()=>{closetheDialog()}} className="border border-2 w-max mx-auto bg-sky-500 py-2 px-3 mt-2 rounded-md"> 
              Add To Inventory
            </div>
          </PopoverContent>
        </Popover>
        {/* ADD field component */}
        
        {
          foodItems.map((item, index) => {
            return  <FoodItemContainer
              key={item.id}
              item={item}
              removeFood={removeFood}
              hasBorder={index !== foodItems.length - 1}
            />})
        }

      </div>
      <div className=" w-4/5  ">
        <Recipies />
      </div>
    </div>
  )


  // return (
  //   <div>
  //     <div className="flex mb-4">
  //       <input
  //         className="border rounded-md p-2 flex-1 mr-2"
  //         value={input["fname"]}
  //         type="text"
  //         onChange={(e) => {
  //           let newer = { ...input };
  //           newer["fname"] = e.target.value;
  //           setInput(newer)
  //         }}
  //         placeholder="Enter the food item"
  //         onKeyDown={(e) => handleKeyPress(e)} // Add this to handle the Enter key press
  //       />
  //       <input type="date" value={input.dateOfExpiry} onChange={(e)=>{
  //         setInput({...input,dateOfExpiry:e.target.value})
  //       }}/>
        
  //       <select 
  //         className="font-light text-gray-600	border-2 border rounded-md mr-2 p-1"
  //         value={input["quantity"]}     
  //         onChange={(e) => {
  //           console.log(e.target.value);
  //           let newer = { ...input };
  //           newer["quantity"] = e.target.value;
  //           setInput(newer)
  //         }}      
  //       >
  //         <option value="Good">Good</option>
  //         <option value="Low">Low</option>
  //         <option value="Excess">Excess</option>
  //       </select>

  //       <button
  //         className="bg-blue-500 rounded-md p-2 text-white"
  //         onClick={bringTheFood}
  //       >
  //         Add item 
  //       </button>
  //     </div>
  //     {foodItems.length > 0 && (
  //       <div className="border rounded-lg">
  //         {foodItems.map((item, index) => (
  //           <FoodItemContainer
  //             key={item.id}
  //             item={item}
  //             removeFood={removeFood}
  //             hasBorder={index !== foodItems.length - 1}
  //           />
  //         ))}
  //       </div>
  //     )}
  //     <button onClick={()=>{console.log(foodItems)}}> log</button>
  //   </div>
  // );
};
