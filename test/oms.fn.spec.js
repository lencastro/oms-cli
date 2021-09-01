import * as omslib from '../src/index';
const sinon = require("sinon");
const { parseArgsStringToArgv } = require('string-argv');
const expect = require('chai').expect
let chai = require('chai')
let chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('logout', function() {
    let stdOutSpy = null, stdErrSpy = null;
    beforeEach(function() {
        stdOutSpy = sinon.spy(process.stdout, 'write');
        stdErrSpy = sinon.spy(process.stderr, 'write');
    });

    it('unknown command check', async ()=>{
        let args = ['','',...parseArgsStringToArgv(`logou`)];
        await omslib.oms(args);
        expect(stdErrSpy.calledOnce).to.be.true;
    });

    it('command check', async ()=>{
        let args = ['','',...parseArgsStringToArgv(`logout`)];
        await omslib.oms(args);
        expect(stdOutSpy.calledOnce).to.be.true;
        expect(stdOutSpy.calledOnceWith(`You've been logged out`)).to.be.true;
    });

    
    
    afterEach(function() {
        stdOutSpy.restore();
        stdErrSpy.restore();
    });
});

describe('logout and command access', function() {
    let stdOutSpy = null, stdErrSpy = null;
    
    beforeEach(function() {
        stdOutSpy = sinon.spy(process.stdout, 'write');
        stdErrSpy = sinon.spy(process.stderr, 'write');
    });
    
    it('before logout test', async function() {
        let ret = await omslib.oms(['','',...parseArgsStringToArgv(`logout`)]);
        expect(stdOutSpy.calledOnce).to.be.true;
        expect(stdOutSpy.calledOnceWith(`You've been logged out`)).to.be.true;
    });
    
    it('after logout access check', async function() {
        let getOrdersRet = await omslib.oms(['','',...parseArgsStringToArgv(`get orders`)]);
        expect(stdErrSpy.calledOnce).to.be.true;
        expect(stdOutSpy.calledOnce).to.be.false;
        expect(stdErrSpy.calledOnceWith(`Access denied`)).to.be.true;
    });

    it('after logout', async function() {
        let ret = await omslib.oms(['','',...parseArgsStringToArgv(`logout`)]);
        expect(stdOutSpy.calledOnce).to.be.true;
        expect(stdOutSpy.calledOnceWith(`You've been logged out`)).to.be.true;
    });

    afterEach(function() {
        stdOutSpy.restore();
        stdErrSpy.restore();
    });

});

describe('login keyword related', function() {    
    let stdOutSpy = null, stdErrSpy = null;
    beforeEach(function() {
        stdOutSpy = sinon.spy(process.stdout, 'write');
        stdErrSpy = sinon.spy(process.stderr, 'write');
    });

    it('should connect server', async function() {
        chai.request('http://localhost:8080').get('/login').end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
        });
    });

    it('before logout test', async function() {
        let ret = await omslib.oms(['','',...parseArgsStringToArgv(`logout`)]);
        expect(stdOutSpy.calledOnce).to.be.true;
        expect(stdOutSpy.calledOnceWith(`You've been logged out`)).to.be.true;
    });

    it('without any parameters', async function() {
        let args = ['','',...parseArgsStringToArgv(`login`)];
        await omslib.oms(args);
        expect(stdErrSpy.calledOnce).to.be.true;
        expect(stdOutSpy.calledOnce).to.be.false;
    });

    it('only with username parameters', async function() {
        let args = ['','',...parseArgsStringToArgv(`login -user test@email.com`)];
        await omslib.oms(args);
        expect(stdErrSpy.calledOnce).to.be.true;
        expect(stdOutSpy.calledOnce).to.be.false;
    });

    it('only with username and password parameters', async function() {
        let args = ['','',...parseArgsStringToArgv(`login -user test@email.com -password testpwd`)];
        await omslib.oms(args);
        expect(stdErrSpy.calledOnce).to.be.true;
        expect(stdOutSpy.calledOnce).to.be.false;
    });

    it('with all parameters', async function() {
        let args = ['','',...parseArgsStringToArgv(`login -user test@email.com -password testpwd -a "http://localhost:8080/login"`)];
        await omslib.oms(args);
        expect(stdOutSpy.calledOnce).to.be.true
        expect(stdOutSpy.calledOnceWith('Session Info written to file')).to.be.true;
    });

    it('after logout', async function() {
        let ret = await omslib.oms(['','',...parseArgsStringToArgv(`logout`)]);
        expect(stdOutSpy.calledOnce).to.be.true;
        expect(stdOutSpy.calledOnceWith(`You've been logged out`)).to.be.true;
    });

    afterEach(function() {
        stdOutSpy.restore();
        stdErrSpy.restore();
    });
    
});

describe('get keyword related', function() {    
    let stdOutSpy = null, stdErrSpy = null;
    beforeEach(function() {
        stdOutSpy = sinon.spy(process.stdout, 'write');
        stdErrSpy = sinon.spy(process.stderr, 'write');
    });

    it('before logout test', async function() {
        let ret = await omslib.oms(['','',...parseArgsStringToArgv(`logout`)]);
        expect(stdOutSpy.calledOnce).to.be.true;
        expect(stdOutSpy.calledOnceWith(`You've been logged out`)).to.be.true;
    });

    it('with all parameters', async function() {
        let args = ['','',...parseArgsStringToArgv(`login -user test@email.com -password testpwd -a "http://localhost:8080/login"`)];
        await omslib.oms(args);
        expect(stdOutSpy.calledOnce).to.be.true
        expect(stdOutSpy.calledOnceWith('Session Info written to file')).to.be.true;
    });


    it('after login get check', async function() {
        let getOrdersRet = await omslib.oms(['','',...parseArgsStringToArgv(`get orders`)]);
        expect(stdErrSpy.calledOnce).to.be.false;
        expect(stdOutSpy.calledOnce).to.be.true;
    });

    it('get specific order', async function() {
        let getOrdersRet = await omslib.oms(['','',...parseArgsStringToArgv(`get orders 14`)]);
        expect(stdErrSpy.calledOnce).to.be.false;
        expect(stdOutSpy.calledOnce).to.be.true;
    });

    it('get fakeorderid should return empty', async function() {
        let getOrdersRet = await omslib.oms(['','',...parseArgsStringToArgv(`get orders _fakeorderid_`)]);
        expect(stdErrSpy.calledOnce).to.be.false;
        expect(stdOutSpy.calledOnce).to.be.true;
    });

    it('create orders with wrong JSON syntax', async function() {
        var JSONStr = `{"orderId":14,"name":"headp hone","productId":"A002","count":1`;
        let getOrdersRet = await omslib.oms(['','',...parseArgsStringToArgv(`create orders -json ${JSONStr}`)]);
        expect(stdErrSpy.calledOnce).to.be.true;
        expect(stdOutSpy.calledOnce).to.be.false;
    });

    it('create orders', async function() {
        var JSONStr = `{"orderId":14,"name":"headp hone","productId":"A002","count":1}`;
        let getOrdersRet = await omslib.oms(['','',...parseArgsStringToArgv(`create orders -json ${JSONStr}`)]);
        expect(stdErrSpy.calledOnce).to.be.false;
        expect(stdOutSpy.calledOnce).to.be.true;
    });

    it('after logout', async function() {
        let ret = await omslib.oms(['','',...parseArgsStringToArgv(`logout`)]);
        expect(stdOutSpy.calledOnce).to.be.true;
        expect(stdOutSpy.calledOnceWith(`You've been logged out`)).to.be.true;
    });

    it('create orders after logout', async function() {
        var JSONStr = `{"orderId":14,"name":"headp hone","productId":"A002","count":1}`;
        let getOrdersRet = await omslib.oms(['','',...parseArgsStringToArgv(`create orders -json ${JSONStr}`)]);
        expect(stdErrSpy.calledOnce).to.be.true;
        expect(stdOutSpy.calledOnce).to.be.false;
        expect(stdErrSpy.calledOnceWith(`Access denied`)).to.be.true;
    });

    it('get specific order after logout', async function() {
        let getOrdersRet = await omslib.oms(['','',...parseArgsStringToArgv(`get orders 14`)]);
        expect(stdErrSpy.calledOnce).to.be.true;
        expect(stdOutSpy.calledOnce).to.be.false;
        expect(stdErrSpy.calledOnceWith(`Access denied`)).to.be.true;
    });

    it('get fakeorderid order after logout', async function() {
        let getOrdersRet = await omslib.oms(['','',...parseArgsStringToArgv(`get orders _fakeorderid_`)]);
        expect(stdErrSpy.calledOnce).to.be.true;
        expect(stdOutSpy.calledOnce).to.be.false;
        expect(stdErrSpy.calledOnceWith(`Access denied`)).to.be.true;
    });

    afterEach(function() {
        stdOutSpy.restore();
        stdErrSpy.restore();
    });

}); 



