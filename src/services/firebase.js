import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const REACT_API_KEY = process.env.REACT_APP_API_KEY;
const PROJECT_ID = process.env.REACT_APP_PROJECT_ID;

export const config = {
    apiKey: REACT_API_KEY,
    projectId: PROJECT_ID,
    authDomain: "react-my-burger-19b3e.firebaseapp.com"
};

class Firebase {
  constructor() {
    app.initializeApp(config);
    this.auth = app.auth();
    this.db = app.firestore();
  }
  
  login(email, password){
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  logout(){
    return this.auth.signOut();
  }

  register(email, password){
    return this.auth.createUserWithEmailAndPassword(email, password);
  }

  //Create the burger order
  async createOrder(order){
    const collection = await this.db.collection('orders');
    let response = null;

    response = await collection.add({
          created: app.firestore.FieldValue.serverTimestamp(),
          order: {...order}
    });

    if(!response){
      throw new Error("Error adding order");
    }else{
      return response.id;
    }
  }

  //get the ingredients
  async getIngredients(){
    const ingredientsDoc = await this.db.collection('ingredients')
      .doc('ingredient').get();
      
    if(ingredientsDoc.exists){
      return await ingredientsDoc.data();
    }else{
      throw new Error("Couldn't load ingredients");
    }
  }

  //get orders return an array of orders
  //TODO: Something is wrong with the query
  async getOrders(userId){
    console.log(userId);
    const ordersRef = await this.db.collection('orders')
      .where("order.customer.customerId", "==", userId).get();
    let orderDocs = [];
    let ordersArray = [];
    
    if(!ordersRef.empty){
      orderDocs = await ordersRef.docs;

      orderDocs.forEach( doc => {
        ordersArray.push({
            id: doc.id,
            price: doc.data().order.price,
            ingredients: doc.data().order.ingredients 
        });
      });

      return ordersArray;
    }else{
      throw Error("There are no orders to load");
    }

  }
}


export default new Firebase();
