const express = require('express');
const router = express.Router();
const models = require('../../../../models');


// search for users' establishments using wildcard on username and user's name
router.route('/').post(async function (req, res) {
  const userSearchFields = req.body;

  let searchFilter = null;

  const usernameSearchField = userSearchFields.username ? userSearchFields.username.replace(/[%_]/g, '').replace(/\*/g, '%').replace(/\?/g, '_') : null;
  const nameSearchField = userSearchFields.name ? userSearchFields.name.replace(/[%_]/g, '').replace(/\*/g, '%').replace(/\?/g, '_') : null;

  try {
    if (userSearchFields && userSearchFields.username) {
      // search on username
      const sqlQuery = `select
          e1."EstablishmentUID" AS "EstablishmentUID",
          e1."LocationID" AS "LocationID",
          e1."NmdsID" AS "NmdsID",
          e1."PostCode" AS "PostCode",
          e1."IsRegulated" AS "IsRegulated",
          e1."Address1" AS "Address",
          e1."IsParent" AS "IsParent",
          e1."NameValue" AS "EstablishmentName",
          e1.updated AS "EstablishmentUpdated",
          e1."ParentID" AS "ParentID",
          p1."NmdsID" AS "ParentNmdsID",
          p1."PostCode" AS "ParentPostCode",
          p1."NameValue" AS "ParentName",
          "Login"."Username" AS "Username",
          "Login"."Active" AS "UserIsActive",
          "Login"."PasswdLastChanged" AS "UserPasswdLastChanged",
          "Login"."LastLoggedIn" AS "UserLastLoggedIn",
          "User"."FullNameValue" AS "UserFullname",
          "User"."IsPrimary" AS "UserIsPrimary",
          "User"."SecurityQuestionValue" AS "UserSecurityQuestion",
          "User"."SecurityQuestionAnswerValue" AS "UserSecurityQuestionAnswer",
          "User"."EmailValue" AS "UserEmail",
          "User"."PhoneValue" AS "UserPhone"
        from cqc."Establishment" e1
          left join cqc."Establishment" p1 on e1."ParentID" = p1."EstablishmentID"
          inner join cqc."User"
            inner join cqc."Login" on "Login"."RegistrationID" = "User"."RegistrationID"
            on "User"."EstablishmentID" = e1."EstablishmentID"
        where e1."Archived"=false
          and "User"."Archived"=false
          and "Login"."Username" ilike :searchUsername
        order by "Login"."Username" ASC`;
      results = await models.sequelize.query(sqlQuery, { replacements: { searchUsername: usernameSearchField },type: models.sequelize.QueryTypes.SELECT });


    } else if (userSearchFields && userSearchFields.name) {
      // search on User's name
      const sqlQuery = `select
          e1."EstablishmentUID" AS "EstablishmentUID",
          e1."LocationID" AS "LocationID",
          e1."NmdsID" AS "NmdsID",
          e1."PostCode" AS "PostCode",
          e1."IsRegulated" AS "IsRegulated",
          e1."Address1" AS "Address",
          e1."IsParent" AS "IsParent",
          e1."NameValue" AS "EstablishmentName",
          e1.updated AS "EstablishmentUpdated",
          e1."ParentID" AS "ParentID",
          p1."NmdsID" AS "ParentNmdsID",
          p1."PostCode" AS "ParentPostCode",
          p1."NameValue" AS "ParentName",
          "Login"."Username" AS "Username",
          "Login"."Active" AS "UserIsActive",
          "Login"."PasswdLastChanged" AS "UserPasswdLastChanged",
          "Login"."LastLoggedIn" AS "UserLastLoggedIn",
          "User"."FullNameValue" AS "UserFullname",
          "User"."IsPrimary" AS "UserIsPrimary",
          "User"."SecurityQuestionValue" AS "UserSecurityQuestion",
          "User"."SecurityQuestionAnswerValue" AS "UserSecurityQuestionAnswer",
          "User"."EmailValue" AS "UserEmail",
          "User"."PhoneValue" AS "UserPhone"
        from cqc."Establishment" e1
          left join cqc."Establishment" p1 on e1."ParentID" = p1."EstablishmentID"
          inner join cqc."User"
            inner join cqc."Login" on "Login"."RegistrationID" = "User"."RegistrationID"
            on "User"."EstablishmentID" = e1."EstablishmentID"
        where e1."Archived"=false
          and "User"."Archived"=false
          and "User"."FullNameValue" ilike :searchFullname
        order by "User"."FullNameValue" ASC`;
      results = await models.sequelize.query(sqlQuery, { replacements: { searchFullname: nameSearchField },type: models.sequelize.QueryTypes.SELECT });

    } else {
      // no search
      return res.status(200).send({});
    }

    res.status(200).send(results.map(thisLogin => {
      const parent = thisLogin.ParentID ? {
        nmdsId: thisLogin.ParentNmdsID,
        name: thisLogin.ParentPostCode,
        postcode: thisLogin.ParentName,
      } : null;

      return {
        name: thisLogin.UserFullname,
        username: thisLogin.Username,
        isPrimary: thisLogin.UserIsPrimary,
        securityQuestion: thisLogin.UserSecurityQuestion,
        securityQuestionAnswer: thisLogin.UserSecurityQuestionAnswer,
        email: thisLogin.UserEmail,
        phone: thisLogin.UserPhone,
        isLocked: !thisLogin.UserIsActive,
        passwdLastChanged: thisLogin.UserPasswdLastChanged,
        lastLoggedIn: thisLogin.UserLastLoggedIn,
        establishment: {
          uid: thisLogin.EstablishmentUID,
          name: thisLogin.EstablishmentName,
          nmdsId: thisLogin.NmdsID,
          postcode: thisLogin.PostCode,
          isRegulated: thisLogin.IsRegulated,
          address: thisLogin.Address,
          isParent: thisLogin.IsParent,
          parent,
          locationId: thisLogin.LocationID,
          }
      };
    }));

  } catch (err) {
    console.error(err);
    return res.status(503).send();
  }
});

module.exports = router;
