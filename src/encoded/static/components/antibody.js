/** @jsx React.DOM */
'use strict';
var React = require('react');
var url = require('url');
var _ = require('underscore');
var globals = require('./globals');
var dbxref = require('./dbxref');
var image = require('./image');

var Attachment = image.Attachment;
var DbxrefList = dbxref.DbxrefList;


var StatusLabel = module.exports.StatusLabel = React.createClass({
    render: function() {
        var status = this.props.status;
        var title = this.props.title;
        if (typeof status === 'string') {
            // Display simple string and optional title in badge
            return (
                <div className="status-list">
                    <span className={globals.statusClass(status, 'label')}>
                        {title ? <span className="status-list-title">{title + ': '}</span> : null}
                        {status}
                    </span>
                </div>
            );
        } else if (typeof status === 'object') {
            // Display a list of badges from array of objects with status and optional title
            return (
                <ul className="status-list">
                    {status.map(function (status) {
                        return(
                            <li key={status.title} className={globals.statusClass(status.status, 'label')}>
                                {status.title ? <span className="status-list-title">{status.title + ': '}</span> : null}
                                {status.status}
                            </li>
                        );
                    })}
                </ul>
            );
        } else {
            return null;
        }
    }
});


var Lot = module.exports.Approval = React.createClass({
    render: function() {
        var context = this.props.context;
        var characterizations = context.characterizations.map(function (item) {
            return globals.panel_views.lookup(item)({context: item, key: item['@id']});
        });

        // Make an array of targets with no falsy entries and no repeats
        var targets = context.characterizations ? context.characterizations.map(function(characterization) {
            return characterization.target; // Might be undefined or empty
        }) : [];
        targets = _.uniq(_.compact(targets), function(target) {return target['@id']; });

        // Make string of alternate accessions
        var altacc = context.alternate_accessions ? context.alternate_accessions.join(', ') : undefined;

        return (
            <div className={globals.itemClass(context, 'view-item')}>
                <header className="row">
                    <div className="col-sm-12">
                        <h2>{context.accession}</h2>
                        {altacc ? <h4 className="repl-acc">Replaces {altacc}</h4> : null}
                        <h3>
                            <span>Antibody against </span>
                            {targets.map(function(target, i) {
                                return <span>{i !== 0 ? ', ' : ''}{target.label}{' ('}<em>{target.organism.scientific_name}</em>{')'}</span>;
                            })}
                        </h3>
                    </div>
                </header>

                <div className="panel data-display">
                    <dl className="key-value">
                        <div data-test="source">
                            <dt>Source (vendor)</dt>
                            <dd><a href={context.source.url}>{context.source.title}</a></dd>
                        </div>

                        <div data-test="productid">
                            <dt>Product ID</dt>
                            <dd><a href={context.url}>{context.product_id}</a></dd>
                        </div>

                        <div data-test="lotid">
                            <dt>Lot ID</dt>
                            <dd>{context.lot_id}</dd>
                        </div>

                        {targets.length ?
                            <div data-test="targets">
                                <dt>Targets</dt>
                                <dd>{targets.map(function(target, i) {
                                    return <span>{i !== 0 ? ', ' : ''}<a href={target['@id']}>{target.label}{' ('}<em>{target.organism.scientific_name}</em>{')'}</a></span>;
                                })}</dd>
                            </div>
                        : null}

                        {context.lot_id_alias.length ?
                            <div data-test="lotidalias">
                                <dt>Lot ID aliases</dt>
                                <dd>{context.lot_id_alias.join(', ')}</dd>
                            </div>
                        : null}

                        <div data-test="host">
                            <dt>Host</dt>
                            <dd className="sentence-case">{context.host_organism.name}</dd>
                        </div>

                        {context.clonality ?
                            <div data-test="clonality">
                                <dt>Clonality</dt>
                                <dd className="sentence-case">{context.clonality}</dd>
                            </div>
                        : null}

                        {context.purifications.length ?
                            <div data-test="purifications">
                                <dt>Purification</dt>
                                <dd className="sentence-case">{context.purifications.join(', ')}</dd>
                            </div>
                        : null}

                        {context.isotype ?
                            <div data-test="isotype">
                                <dt>Isotype</dt>
                                <dd className="sentence-case">{context.isotype}</dd>
                            </div>
                        : null}

                        {context.antigen_description ?
                            <div data-test="antigendescription">
                                <dt>Antigen description</dt>
                                <dd>{context.antigen_description}</dd>
                            </div>
                        : null}

                        {context.antigen_sequence ?
                            <div data-test="antigensequence">
                                <dt>Antigen sequence</dt>
                                <dd>{context.antigen_sequence}</dd>
                            </div>
                        : null}

                        {context.aliases && context.aliases.length ?
                            <div data-test="aliases">
                                <dt>Aliases</dt>
                                <dd>{context.aliases.join(", ")}</dd>
                            </div>
                        : null}
                        
                        {context.dbxrefs && context.dbxrefs.length ?
                            <div data-test="dbxrefs">
                                <dt>External resources</dt>
                                <dd><DbxrefList values={context.dbxrefs} /></dd>
                            </div>
                        : null}

                    </dl>
                </div>

                <div className="characterizations">
                    {characterizations}
                </div>
            </div>
        );
    }
});

globals.content_views.register(Lot, 'antibody_lot');


var StandardsDocuments = React.createClass({
    render: function() {
        return (
            <div>
                {this.props.docs.map(function(doc) {
                    return (<div className="multi-dd"><a href={doc['@id']}>{doc.aliases[0]}</a></div>);
                })}
            </div>
        );
    }
});


var Characterization = module.exports.Characterization = React.createClass({
    render: function() {
        var context = this.props.context;
        var figure = <Attachment context={this.props.context} className="characterization" />;

        var attachmentHref, download;
        if (context.attachment) {
            attachmentHref = url.resolve(context['@id'], context.attachment.href);
            download = (
                <a data-bypass="true" href={attachmentHref} download={context.attachment.download}>
                    {context.attachment.download}
                </a>
            );
        } else {
            download = (
                <em>Document not available</em>
            );
        }

        // Compile a list of attached standards documents
        var standardsDocuments = context.documents.filter(function(doc) {
            return doc.document_type === "standards document";
        });

        return (
            <section className={globals.itemClass(context, 'view-detail panel')}>
                <div className="row">
                    <div className="col-sm-4 col-md-6">
                        <figure>
                            {figure}
                            <figcaption>
                                <span>{context.status}</span>
                            </figcaption>
                        </figure>
                    </div>
                    <div className="col-sm-8 col-md-6">
                        <dl className="characterization-meta-data key-value">
                            <div data-test="method">
                                <dt className="h3">Method</dt>
                                <dd className="h3">{context.characterization_method}</dd>
                            </div>

                            <div data-test="targetspecies">
                                <dt className="h4">Target species</dt>
                                <dd className="h4 sentence-case"><em>{context.target.organism.scientific_name}</em></dd>
                            </div>

                            {context.caption ?
                                <div data-test="caption">
                                    <dt>Caption</dt>
                                    <dd className="sentence-case">{context.caption}</dd>
                                </div>
                            : null}

                            <div data-test="submitted">
                                <dt>Submitted by</dt>
                                <dd>{context.submitted_by.title}</dd>
                            </div>

                            <div data-test="lab">
                                <dt>Lab</dt>
                                <dd>{context.lab.title}</dd>
                            </div>

                            <div data-test="grant">
                                <dt>Grant</dt>
                                <dd>{context.award.name}</dd>
                            </div>

                            <div data-test="image">
                                <dt>Image</dt>
                                <dd><StatusLabel status={context.status} /></dd>
                            </div>


                            {standardsDocuments.length ?
                                <div data-test="standardsdoc">
                                    <dt>Standards documents</dt>
                                    <dd><StandardsDocuments docs={standardsDocuments} /></dd>
                                </div>
                            : null}

                            <div data-test="download">
                                <dt><i className="icon icon-download"></i> Download</dt>
                                <dd>{download}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </section>
        );
    }
});

globals.panel_views.register(Characterization, 'antibody_characterization');
