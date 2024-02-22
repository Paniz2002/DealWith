db.createUser({
  user: "user",
  pwd: "secretPassword",
  roles: [ { role: "dbOwner", db: "taw-project" } ]
})

db.users.insert({
  name: "user"
})
