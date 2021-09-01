const fs = require('fs');
const commander = require('commander'); 
const program = new commander.Command();
const axios = require('axios');
const token = require('../context/session.json')



async function _login(cred, options, command) {
  axios({
    method: 'post',
    url: cred.authurl,
    auth: {
      username: cred.user,
      password: cred.password
    }
  }).then(function ({data=null}) {

    let authdata = Buffer.from(`${data.username}:${data.password}`).toString('base64')
    let toWrite = JSON.stringify({session: authdata});
    fs.writeFile('./context/session.json', toWrite, (err) => {
      if (err) throw err;
      console.log('Session Info written to file');
    });
    
  });
}

async function _logout(cred, options, command) {
  let toWrite = JSON.stringify({"session" : ""});
    fs.writeFile('./context/session.json', toWrite, (err) => {
      if (err) throw err;
      console.log('Data written to file');
  });
}

async function _get(schemaObject, uniqueId, options, command) {
    let { session='' } = token;
    if (!session) {
      console.log('Access denied')
      return
    }
    let url = `http://localhost:8080/oms/${schemaObject}`
    if (uniqueId){
      url = `${url}/${uniqueId}`
    }
    axios({ 
      method: 'get',
      url: url,
      headers: {
        'Authorization': `Basic ${session}`
      },
    }).then(function ({data=null}) {
      console.log( data )
    }).catch((e)=>{
      console.log('API Error')
    });
}

async function _create(schemaObject,data, options, command) {
      let { session='' } = token;
      if (!session) {
        console.log('Access denied')
        return
      }
    let url = `http://localhost:8080/oms/${schemaObject}`;
    axios({ method: 'post',
      url: url,
      data : data.json,
      headers: {
        'Authorization': `Basic ${session}`
      },
    }).then(function ({data=null}) {
      console.log( data )
    }).catch((e)=>{
      console.log('API Error', e)
    });

}


function stringToJSON(str) {
  let ret = null;
  try {
    ret = JSON.parse(str);
  } catch(e) { 
    throw new commander.InvalidArgumentError('Not a JSON');
  }
  return ret;
}


async function parseArgumentsIntoOptions(rawArgs) {

  program.command('login')
  .requiredOption('-user, --user <data>', 'provide username')
  .requiredOption('-password, --password <data>', 'provide password')
  .addOption(
    new commander.Option( '-a, --authurl <url>',  'provide auth url')
    .makeOptionMandatory()
  )
  .action(_login);

  program.command('logout')
  .action(_logout);

  program.command('get')
  .argument('<schema_object_name>', 'schema object such as tables, views, stored procedures etc')
  .argument('[id]', 'provide the unique id')
  .action(_get);

  program.command('create')
  .argument('<schema_object_name>', 'schema object such as tables, views, stored procedures etc')
  .addOption(
    new commander.Option( '-json, --json <jsonstr>',  'provide json string')
    .argParser(stringToJSON).makeOptionMandatory()
  )
  .action(_create);
 
  await program.parseAsync(rawArgs);

}

export function oms(args){
    let options = parseArgumentsIntoOptions(args);
}