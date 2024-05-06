"use client";
import React from 'react'
import {dishes} from "./recipies"


function RecipiesContainer() {    
  return (
    <div className='flex flex-wrap w-full'>
    {
        dishes.map((dish,index) => {
            return (
                <RecipiesBox dish = {dish} key={index}/>
            )
        })
    }
    </div>
  )
}

function RecipiesBox({dish}:any) {
    return (
        <div className="rounded overflow-hidden  w-1/3">
            <img className="w-[220px] h-[240px] m-auto" src={dish.imageURL} alt={dish.imageALT} />
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">{dish.name}</div>
              <p className="text-gray-700 text-base">
                {dish.description}
              </p>
            </div>
        </div>
    )
}

export default RecipiesContainer;