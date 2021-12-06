### _Created by sonbnt on 3/3/2021_ 
_Description:_
* List all changes to the game in order to build storage module
* Some notes and APIs to others

#### 1. Changes
* Create src/Lobby/Module/Storage folder and all files in it (remember to add to project.json)
* Change lobby GUI, add storage button and move setting button  
* 
*  
#### 2. Notes
##### 1. API
* getUserAvatarFrameSprite(): Sprite
* getUserAvatarFramePath(): String
##### 2. Other
#### 4. Data Structures:
userItemInfo = {
    type?: {
        id?: [{
            status: int, 
            num: int, 
            remainTime:long
        }]
    }
}
itemConfig = {
    type?: {
        id?: {
            name: string,
            description: string,
            enable: bool,
            vip: int,
            level: int,
            listItemId: [int],
            groups: {?},
            subTypes: {
                subType?: {
                    price: int,
                    startTime: string
                    expireTime: int
                }
            }
        }
    }
}
shopItemConfig = {
    type?: {
        useType: int,
        hasDiscount: bool,
        listItem: {
            id?: {
                conditions: [{
                    type: int,
                    num: int
                }],
                options: [{
                    subType: int,
                    price: int,
                    discount: int,
                    expireTime: int
                }]
            }
        }
    }
}