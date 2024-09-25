import { type } from "../index.ts";

const schema = type({
    name: 'string>3',
    'age?': type('string.numeric.parse').to('number>18')
});
const result=schema({
    name:'me',
    age:'5'
})

console.log(result+'')