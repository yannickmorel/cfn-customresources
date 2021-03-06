'use strict';
const AWS = require('aws-sdk');
const CustomAWSResource = require('../CustomAWSResource.js');

module.exports = class Certificate extends CustomAWSResource {

    constructor(req) {
        // TODO: make this a generic property
        if (req.ResourceProperties.Region) {
            AWS.config.region = req.ResourceProperties.Region;
            delete req.ResourceProperties.Region;
        }
        super('ACM');
    }

    //TODO refactor
    requestParams(req) {
        return super.createParams(req);
    }

    describeParams(params) {
        return params;
    }

    describe(p) {
        const describe = this.serviceMethod('describe');
    }

    serviceCreate(req) {
        const request = this.serviceMethod('request');
        const describe = this.serviceMethod('describe');

        const until = (c, f) => function g(p) {
            return f(p).then(d => c(d) ? d : g(p));
        };
        const hasResourceRecord = d => d.Certificate.DomainValidationOptions.find(o => o.ValidationMethod !== "DNS" || o.ResourceRecord);

        return request(req).then(until(hasResourceRecord, describe));
    }

    deleteParams(req) {
        return {CertificateArn: req.PhysicalResourceId};
    }

    response(data) {
        const cert = data.Certificate;
        return Object.assign(cert,{
            Id: cert.CertificateArn,
            ValidationRecordName: cert.DomainValidationOptions[0].ResourceRecord.Name,
            ValidationRecordValue: cert.DomainValidationOptions[0].ResourceRecord.Value,
            ValidationRecordType: cert.DomainValidationOptions[0].ResourceRecord.Type
        });
    }
};