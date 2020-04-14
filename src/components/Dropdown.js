import React, {useState} from 'react'
import Button from './Button'

function Dropdown({list, className ='', setService}) {
    
    return (
        <div className="dropdown">
            <div>
                {list.map(item => 
                    <Button onClick={() => setService(item.service)}>{item.service}</Button>
                )}
            </div>


       </div>
    );
}

export default Dropdown;