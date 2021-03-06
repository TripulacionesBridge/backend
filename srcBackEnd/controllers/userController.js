const { doQuery } = require('../utilities/doQuery');
const SHA256 = require('crypto-js/sha256');
const {
  saveBannedCategories,
  delBannedCategories,
  saveBannedIngredients,
  delBannedIngredients,
  addFav,
  delFav,
  getFavs,
} = require('../utilities/profile/profile');

exports.getUser = async (req, res) => {
  const user = res.user.idUser;

  try {
    let sql = 'SELECT * FROM Users  WHERE id = "?"';

    const results = await doQuery(sql, user);
    if (results.length !== 0) {
      const profile = {
        email: results[0].email || '',
        pass: results[0].pass || '',
        userName: results[0].userName || '',
        boolFavCalendar: results[0].boolFavCalendar || '',
        photo: results[0].photo || '',
        name: results[0].name || '',
      };

      res.send({
        OK: 1,
        message: 'Perfil de usuario',
        profile: profile,
      });
    } else throw Error('No existe el usuario');
  } catch (error) {
    res.status(500).send({
      OK: 0,
      message: `Error al recibir perfil de usuario: ${error}`,
    });
  }
};

exports.updateUser = async (req, res) => {
  const { email, pass, userName, boolFavCalendar, photo, name } = req.body;
  const idUser = res.user.idUser;

  let sql = `UPDATE Users SET `;

  const sqlSet = [];
  const sqlValues = [];

  if (email) {
    sqlSet.push(' email = ? ');
    sqlValues.push(email);
  }

  if (pass) {
    sqlSet.push(' pass = ? ');
    sqlValues.push(SHA256(pass).toString());
  }

  if (userName) {
    sqlSet.push(' userName = ? ');
    sqlValues.push(userName);
  }

  if (boolFavCalendar) {
    sqlSet.push(' boolFavCalendar = ?');
    sqlValues.push(boolFavCalendar);
  }

  if (photo) {
    sqlSet.push(' photo = ? ');
    sqlValues.push(photo);
  }

  if (name) {
    sqlSet.push(' name = ? ');
    sqlValues.push(name);
  }

  sql += sqlSet.join(',') + ` WHERE id =  ?`;
  sqlValues.push(idUser);

  console.log(sql);
  console.log(sqlValues);

  try {
    const results = await doQuery(sql, sqlValues);
    console.log('SEGUNDO', results);

    if (!results.affectedRows) {
      throw 'No se ha actualizado el perfil';
    }
    res.send({
      OK: 1,
      message: 'Perfil actualizado',
    });
  } catch (error) {
    console.log(error);
    //no se ha podido actualizar perfil de ninguna de las dos maneras (insert o update)
    res.status(500).send({
      OK: 0,
      message: 'No se ha podido actualizar perfil',
    });
  }
};

exports.updateUserBannedCategories = async (req, res) => {
  const { idUser } = res.user;
  const bannedObj = req.body.bannedObj;

  console.log("TESTTT", res.user)

  //Para hacer el update vamos a borrar primero todo lo que hay del usuario
  const del = await delBannedCategories(idUser).catch((error) => {
    res.status(500).send({
      OK: 0,
      message: `Error al borrar categor??as baneadas del usuario: ${error}`,
    });
    throw error;
  });

  //Luego a??adimos el objeto entero de configuraci??n
  const add = await saveBannedCategories(bannedObj, idUser).catch((error) => {
    res.status(500).send({
      OK: 0,
      message: `Error al a??adir categor??as baneadas del usuario: ${error}`,
    });
    throw error;
  });

  res.send({
    OK: 1,
    message: `Actualizadas las categor??as baneadas del usuario. Borradas ${del}, A??adidas ${add}`,
  });
};
/* 
exports.saveUserBannedCategories = async (req, res) => {
    const { idUser } = res.user;
    const bannedObj = req.body.bannedObj;

    const add = await saveBannedCategories(bannedObj, idUser).catch((error) => {
      res.status(500).send({
        OK: 0,
        message: `Error al a??adir categor??as baneadas del usuario: ${error}`,
      });
      throw error;
    });

    res.send({
      OK: 1,
      message: `Actualizadas las categor??as baneadas del usuario. A??adidas ${add}`,
    });
} */

exports.updateUserBannedIngredients = async (req, res) => {
  const bannedIngredients = req.body;
  const { idUser } = res.user;

  //Para hacer el update vamos a borrar primero todo lo que hay del usuario
  const del = await delBannedIngredients(idUser).catch((error) => {
    res.status(500).send({
      OK: 0,
      message: `Error al borrar los ingredientes baneados del usuario: ${error}`,
    });
    throw error;
  });

  //Luego a??adimos el objeto entero de configuraci??n
  const add = await saveBannedIngredients(bannedIngredients, idUser).catch(
    (error) => {
      res.status(500).send({
        OK: 0,
        message: `Error al a??adir los ingredientes baneados del usuario: ${error}`,
      });
      throw error;
    },
  );

  res.send({
    OK: 1,
    message: `Actualizadas los ingredientes baneados del usuario. Borradas ${del}, A??adidas ${add}`,
  });

  //TODO Cuando sepamos como atacar a la tabla de ingredientes de DATA hay que ver como se hace este m??todo.

  //Si podemos hacer autocompletado en front se podr??a hacer igual que las categor??as a??adiendo a la tabla el ID de ingrediente.
};

exports.addUserFav = async (req, res) => {
  const { idUser } = res.user;
  const { idRecipe } = req.body;
  addFav(idUser, idRecipe, res);
};

exports.delUserFav = async (req, res) => {
  const { idUser } = res.user;
  const { idRecipe } = req.body;
  delFav(idUser, idRecipe, res);
};

exports.getUserFav = async (req, res) => {
  const { idUser } = res.user;
  getFavs(idUser, res);
};
