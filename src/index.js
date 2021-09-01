import { writeFile } from 'fs/promises';
const fs = require('fs');
const commander = require('commander'); 
const program = new commander.Command();
const axios = require('axios');
const path = require('path');

const getToken = ()=>{
  var jsonPath = path.join(__dirname, '..', 'context','session.json');
  try{
    let rawdata = fs.readFileSync(jsonPath);
    return JSON.parse(rawdata);
  } catch(e) {
    return {}
  }
}

const _login = (cred) => {
  return new Promise((resolve, reject) => {
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
      let writeToFile = async (filePath, dataToWrite )=>{
        try {
          await writeFile(filePath, dataToWrite);
          resolve("Session Info written to file");
        } catch(e) {
          reject('something went wrong error');
        }
      }
      writeToFile('./context/session.json', toWrite);
      
    }).catch(function () {
      reject('something went wrong error');
    })
  })
}

const _logout = () => {
  return new Promise((resolve, reject) => {
    let toWrite = JSON.stringify({"session" : ""});
    let writeToFile = async (filePath, dataToWrite )=>{
      try {
        await writeFile(filePath, dataToWrite);
        resolve("You've been logged out");
      } catch(e) {
        reject('something went wrong error');
      }
    }
    writeToFile('./context/session.json', toWrite);
  })

  
}

const _get = (schemaObject, uniqueId) => {
  return new Promise((resolve, reject) => {
    let { session='' } = getToken();
    if (!session) {
      reject('Access denied')
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
    }).then(function ({data=[]}) {
        let ret = Array.isArray(data) ? data : [];
        resolve(JSON.stringify(ret));
    }).catch((e)=>{
        reject('something went wrong error');
    });

  })
}

const _create = (schemaObject, data) => {
  return new Promise((resolve, reject) => {
    let { session='' } = getToken();
    if (!session) {
      reject('Access denied')
    }
    let url = `http://localhost:8080/oms/${schemaObject}`
    axios({ method: 'post',
      url: url,
      data : data.json,
      headers: {
        'Authorization': `Basic ${session}`
      },
    }).then(function ({data=[]}) {
        let ret = Array.isArray(data) ? data : []
        resolve(JSON.stringify(ret))
    }).catch((e)=>{
        reject('something went wrong error');
    });

  })
}


function stringToJSON(str) {
  let ret = null;
  try {
    ret = JSON.parse(str);
  } catch(err) { 
    throw new commander.InvalidArgumentError(err.message);
  }
  return ret;
}

export async function oms(rawArgs) {

    program.exitOverride();
    program.configureOutput({
      writeOut: (str) => process.stdout.write(str),
      writeErr: (str) => process.stderr.write(str)
    });

    let { writeOut, writeErr } = program.configureOutput();

    program.command('login')
    .requiredOption('-user, --user <data>', 'provide username')
    .requiredOption('-password, --password <data>', 'provide password')
    .addOption(new commander.Option( '-a, --authurl <url>',  'provide auth url').makeOptionMandatory())
    .action(async (cred, ...args) => {
      try {
        let ret = await _login(cred);
        writeOut(ret);
      } catch(err) {
        writeErr(err);
      }
    });

    program.command('logout')
    .action(async ()=>{
      try {
        let ret = await _logout()
        writeOut(ret);
      } catch(err){
        writeErr(err);
      }
    });

    program.command('get')
    .argument('<schema_object_name>', 'schema object such as tables, views, stored procedures etc')
    .argument('[id]', 'provide the unique id')
    .action(async (schemaObject, id, ...args)=>{
      try {
        let ret = await _get(schemaObject, id)
        writeOut(ret);
      } catch(err){
        writeErr(err);
      }
    });

    program.command('create')
    .argument('<schema_object_name>', 'schema object such as tables, views, stored procedures etc')
    .addOption(new commander.Option( '-json, --json <jsonstr>',  'provide json string').argParser(stringToJSON).makeOptionMandatory())
    .action(async (schemaObject, data, ...args)=>{
      try {
        let ret = await _create(schemaObject,data);
        writeOut(ret);
      } catch(err) {
        writeErr(err);
      }
    });

    try { 
      await program.parseAsync (rawArgs); 
    } catch (e) {}

}