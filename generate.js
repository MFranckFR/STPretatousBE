// generate.js
// https://github.com/marak/Faker.js/
// example with locale
// https://zetcode.com/javascript/fakerjs/
// const faker = require('faker/locale/fr');

const faker = require('faker');
faker.locale = "fr"

const accountNb = 2;
const userNb = 3
const productNb = 5;
const bookingReqNb = 10;
const bookingNb = 5;
const returnNb = 3;

const prodStatusEnum = ['neuf', 'moyen', 'bien usée'];
const bookReqStatusEnum = ['pending', 'accepted', 'rejected', 'cancelled'];
/*
// template
accounts:[...Array(accountNb)].map((value, index)=>({

})),
*/

// const getRandomElt = (elts) => {
//   const randIndex = Math.round(Math.random() * elts.length);
//   return randIndex >= elts.length ? elts[elts.length-1] : elts[randIndex];
// }


// === Comptes ===
const accounts = [...Array(accountNb)].map((value, index)=>({
  id:index,
  login:faker.internet.email(),
  password:faker.internet.password(5)
}));


// === Utilisateurs ===
const users = [...Array(userNb)].map((value, index)=>({
  id: index + 1,
  accountId:null,
  pseudo: faker.random.alphaNumeric(3),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  birthday: faker.date.between('1980-01-01', '2000-12-31'),
  email: faker.internet.email(),
  address: faker.address.streetAddress(),
  addressAdd: faker.address.streetAddress(),
  zipCode: faker.address.zipCode(),
  city: faker.address.city(),
  country: "France",
  phone:faker.phone.phoneNumber(),
  mobile:faker.phone.phoneNumber(),
  image:faker.image.avatar()
}));
// email selon prenom et non
// et repartition des users sur le même compte sauf le dernier.
for(let i=0; i < users.length; i++){
  users[i].email = faker.internet.email(users[i].firstName, users[i].lastName);
  users[i].accountId = i == users.length - 1 ? accounts[1].id : accounts[0].id;
}


// === Produits ===
const products = [...Array(productNb)].map((product, index)=>({
    id:index + 1,
    brwUserId:null,
    titre:faker.random.words(5),
    description:faker.lorem.words(20),
    images:[...Array(faker.random.number(4) + 1)].fill(faker.random.image()),
    status:faker.random.arrayElements(prodStatusEnum),
    //bookingEnabled:faker.random.boolean()
    bookingEnabled:true
}));

// repartition des products parmi les users
const prodPerUser = Math.round(productNb / userNb);
let uIndex = 0, cpt = 0;
for(let pIndex=0; pIndex < products.length; pIndex++){
  if(cpt >= prodPerUser){
    cpt = 0;
    if(uIndex + 1 < users.length){
      uIndex++;
    }
  }
  products[pIndex].brwUserId = users[uIndex].id;
  cpt++;
}


// Demandes de réservation = BookingRequests
// L'emprunteur doit être différent du prêteur
// lnrUserId <> brwUserId

const generateBookingReq = (index) =>{
  const dtReqStart = faker.date.recent(2);
  return {
    id:index + 1,

    productId:null,
    brwUserId:null,
    lnrUserId:null,

    // Etat de la demande : pending, accepted, rejected, cancelled
    status: faker.random.arrayElement(bookReqStatusEnum),
    hasBooking:false, // true si une réservation a été généré
    dtStatus: dtReqStart,

    dtStart:faker.date.recent(3, dtReqStart),
    dtEnd: dtReqStart,
    dtBookStart:dtReqStart,
    dtBookEnd:faker.date.soon(2, dtReqStart)
  };
}
const bookingRequests = [...Array(bookingReqNb)].map(
  (value, index)=>generateBookingReq(index)
);

// Répartition des demandesResa parmi les utilisateurs
// sachant qu'un prêteur ne peut pas être aussi un emprunteur
const bookingReqPerProduct = Math.round(bookingReqNb / productNb);
let pIndex = 0,
remain_user_ids = []; // userIds possibly loaner = all user ids but borrower id

cpt = 0;
for(bqIndex=0; bqIndex < bookingRequests.length; bqIndex++){
  // Afin d'éviter de répéter pour chaque boucle la même operation
  // à la premier boucle on récupère la liste des userIds
  // qui ne sont pas le propriétaire du produit
  if(bqIndex === 0){
    remain_user_ids = users.map((user, index)=>user.id).filter(id=>id !== products[pIndex].brwUserId); // filter((id, index)=>id ==! 1); // all users but borrower
    // console.log('remain_user_ids', remain_user_ids);
  }

  // tous les bookingReqPerProduct ont change de produit
  if(cpt >= bookingReqPerProduct){
    cpt = 0;
    if(pIndex + 1 < products.length){
      pIndex++;
      // liste des userIds qui ne sont pas le propriétaire du produit
      remain_user_ids = users.map((user, index)=>user.id).filter(id=>id !== products[pIndex].brwUserId); // filter((id, index)=>id ==! 1); // all users but borrower
      // console.log('pIndex++remain_user_ids', remain_user_ids);
    }
  }

  // Clés étrangères: relation dans la demandeResa entre produit/preteur/emprunteur
  bookingRequests[bqIndex].productId = products[pIndex].id;
  bookingRequests[bqIndex].brwUserId = products[pIndex].brwUserId;
  bookingRequests[bqIndex].lnrUserId = faker.random.arrayElement(remain_user_ids);

  cpt++;
}


// === Réservations ===
// Parmi les demandeReservations ont choisi en transme qu'une seule en réservation.
// Les autres sont annulées.
const generateBookings = (index) => {
  return {
    id:index + 1,

    bookReqId:null,
    productId:null,
    brwUserId:null,
    lnrUserId:null,

    dtStart:bookingRequests[0].dtEnd,
    dtEnd: faker.date.soon(2, bookingRequests[0].dtEnd),
    dtBookStart:bookingRequests[0].dtBookStart,
    dtBookEnd:faker.date.soon(2, bookingRequests[0].dtBookStart)
  }
}
const bookings = [...Array(bookingNb)].map(
  (value, index)=>(generateBookings(index))
);

// Répartition des réservations parmi les demandesDeRéservation
const bookingPerBookRequest = Math.round(bookingNb / bookingReqNb);
let bookReqIndex = 0;
cpt = 0;
for(bookIndex=0; bookIndex < bookings.length; bookIndex++){
  // Afin d'éviter de répéter pour chaque boucle la même operation
  // à la premier boucle on récupère la liste des userIds
  // qui ne sont pas le propriétaire du produit
  if(bookIndex === 0){
    // remain_user_ids = users.map((user, index)=>user.id).filter(id=>id !== products[bookReqIndex].brwUserId); 
    // console.log('remain_user_ids', remain_user_ids);
  }

  // tous les bookingPerBookRequest ont change de produit
  if(cpt >= bookingPerBookRequest){
    cpt = 0;
    if(bookReqIndex + 1 < products.length){
      bookReqIndex++;
      // liste des userIds qui ne sont pas le propriétaire du produit
      remain_user_ids = users.map((user, index)=>user.id).filter(id=>id !== products[bookReqIndex].brwUserId);
      // console.log('bookReqIndex++remain_user_ids', remain_user_ids);
    }
  }

  // Clés étrangères: relation dans la demandeResa entre produit/preteur/emprunteur
 
  bookings[bookIndex].bookReqId = bookingRequests[bookReqIndex].id;
  bookings[bookIndex].productId = bookingRequests[bookReqIndex].productId;
  bookings[bookIndex].brwUserId = bookingRequests[bookReqIndex].brwUserId;
  bookings[bookIndex].lnrUserId = bookingRequests[bookReqIndex].lnrUserId;

  cpt++;
}

// Prêts
// const loans = [...Array(pret_nb)].map((value, index)=>({
//   login:users[index].email,
//   password:faker.internet.password(10)
// }));

// // Messages de contact
const contact_messages = [
  {
    name:'nom',
    email:'toto@email.com',
    subject:'feedback',
    message:'un message'
  }
];


module.exports = () => ({
  accounts:accounts,
  users: users,
  products:products,
  bookingRequests:bookingRequests,
  bookings:bookings,
  //loans:loans,
  //returns:retours,
  contact_messages:contact_messages
});




// module.exports = () => ({
//   accounts:accounts,
//   users: users,
//   products:products,
//   bookingRequests:bookingRequests,
//   loans:loans,
//   retours:retours,
//   contact_mail:contact_messages
// });
