
// 1er exo

db.films.find()
        .limit(10)
        .sort({score: -1})


//2eme exo
db.films.find()
    .skip (10)
    .limit(10)
    .sort({score: -1})

// 3eme exo
db.films.find({rating: 3}, {
    title: 1, 
    rating: 1,
    _id:0
})

//4eme exo
db.films.find({year: {$gte: 1990, $lte: 1999}}, {
    title: 1,
    year:1,
    _id: 0
})

//5eme exo
db.films.find({year: {$gt: 2000}, 
    genre: 'Horror'
}, 
{
    title: 1,
    year:1,
    genre: 1,
    _id: 0
})

//6eme exo
db.films.find({actors:/^tom hanks$/i},{
    title: 1,
}).sort({year: 1})

//7eme exo
db.films.find({year: {$gte: 2000, $lt: 2010},
genre: 'Adventure'},
{
    title: 1,
    year:1,
    nbActors: {$size: '$actors'}
}).sort({rating:1})


//8eme exo
db.films.find({
    title:1,
    actors:1
}).count({actors:5})

