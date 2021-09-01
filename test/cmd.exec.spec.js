import { exec } from 'child_process';
const expect = require('chai').expect
let chai = require('chai')
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
const exeCmd = (cmdString) => {
    return new Promise((resolve, reject) => {
        exec(cmdString, { maxBuffer: 2048 * 1024 },  (error='', stdout='', stderr='') => {
            if (error) {
                resolve({
                    _error : error, 
                    _stdout : stdout.trim(), 
                    _stderr : stderr.trim() })
                return;
            }
            resolve({
                _error : error, 
                _stdout : stdout.trim(), 
                _stderr : stderr.trim() })
        })
    })
}

describe('logout', function() {
    it('command check', async function() {
        let { _error='', _stdout='', _stderr='' } = await exeCmd('oms logout');
        expect(_error).to.equal(null);
        expect(_stdout).to.equal("You've been logged out");
        expect(_stderr).to.equal('');
        expect(true).to.equal(true);
    });
});

describe('logout access', function() {
    before(async function() {
        await exeCmd('oms logout');
    });
    it('access check', async function() {
        let { _error='', _stdout='', _stderr='' } = await exeCmd('oms get orders');
        expect(_error).to.equal(null);
        expect(_stdout).to.equal('');
        expect(_stderr).to.equal("Access denied");
    });
});

describe('login', function() {
    it('should connect server', async function() {
        chai.request('http://localhost:8080').get('/login').end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
        });
    });
    it('without any parameters', async function() {
        let { _error='', _stdout='', _stderr='' } = await exeCmd('oms login');
        expect(_stderr).to.equal("error: required option '-user, --user <data>' not specified");
    });
    it('only with username parameters', async function() {
        let { _error='', _stdout='', _stderr='' } = await exeCmd('oms login -user test@email.com');
        expect(_stderr).to.equal("error: required option '-password, --password <data>' not specified");
    });
    it('only with username and password parameters', async function() {
        let { _error='', _stdout='', _stderr='' } = await exeCmd('oms login -user test@email.com -password testpwd');
        expect(_stderr).to.equal("error: required option '-a, --authurl <url>' not specified");
    });
    it('access', async function() {
        let { _error='', _stdout='', _stderr='' } = await exeCmd('oms login -user test@email.com -password testpwd -a "http://localhost:8080/login"');
        expect(_error).to.equal(null);
        expect(_stdout).to.equal("Session Info written to file");
        expect(_stderr).to.equal('');
    });
    after(async function() {
        await exeCmd('oms logout');
    });
});

describe('orders', function() {
    before(async function() {
        await exeCmd('oms logout');
        await exeCmd('oms login -user test@email.com -password testpwd -a "http://localhost:8080/login"');
    });

    it('get', async function() {
        let { _error='', _stdout='', _stderr='' } = await exeCmd('oms get orders');
        expect(_error).to.equal(null);
        expect(_stderr).to.equal('');
        let response = eval(`(${_stdout})`);
        expect(response).to.be.a('array')
    });

    it('get specific order', async function() {
        let { _error='', _stdout='', _stderr='' } = await exeCmd('oms get orders 14');
        expect(_error).to.equal(null);
        expect(_stderr).to.equal('');
        let response = eval(`(${_stdout})`);
        expect(response).to.have.lengthOf(1);
    });

    it('get fakeorderid should return empty', async function() {
        let { _error='', _stdout='', _stderr='' } = await exeCmd('oms get orders _fakeorderid_');
        expect(_error).to.equal(null);
        expect(_stderr).to.equal('');
        let response = eval(`(${_stdout})`);
        expect(response).to.have.lengthOf(0);
    });

    it('create orders', async function() {
        var JSONStr = `\"{\\\"orderId\\\":14,\\\"name\\\":\\\"headp hone\\\",\\\"productId\\\":\\\"A002\\\",\\\"count\\\":1}\"`
        let { _error='', _stdout='', _stderr='' } = await exeCmd(`oms create orders -json ${JSONStr}`);
        expect(_error).to.equal(null);
        expect(_stderr).to.equal('');
        let response = eval(`(${_stdout})`);
        response = response.filter((item)=>{ return item.orderId == 14})
        expect(response).to.be.a('array');
        expect(response).to.have.lengthOf(1);
    });
    
});