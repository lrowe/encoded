'use strict';
var React = require('react');
var _ = require('underscore');
var globals = require('./globals');
var navbar = require('./navbar');
var dataset = require('./dataset');
var dbxref = require('./dbxref');
var item = require('./item');

var Breadcrumbs = navbar.Breadcrumbs;
var DbxrefList = dbxref.DbxrefList;
var Dbxref = dbxref.Dbxref;
var ExperimentTable = dataset.ExperimentTable;
var RelatedItems = item.RelatedItems;

var Target = module.exports.Target = React.createClass({
    render: function() {
        var context = this.props.context;
        var itemClass = globals.itemClass(context, 'view-detail key-value');
        var geneLink, geneRef, baseName, sep;

        if (context.organism.name == "human") {
            geneLink = globals.dbxref_prefix_map.HGNC + context.gene_name;
        } else if (context.organism.name == "mouse") {
            var uniProtValue = JSON.stringify(context.dbxref);
            sep = uniProtValue.indexOf(":") + 1;
            var uniProtID = uniProtValue.substring(sep, uniProtValue.length - 2);
            geneLink = globals.dbxref_prefix_map.UniProtKB + uniProtID;
        } else if (context.organism.name == 'dmelanogaster' || context.organism.name == 'celegans') {
            var organismPrefix = context.organism.name == 'dmelanogaster' ? 'FBgn': 'WBGene';
            var baseUrl = context.organism.name == 'dmelanogaster' ? globals.dbxref_prefix_map.FlyBase : globals.dbxref_prefix_map.WormBase;
            geneRef = _.find(context.dbxref, function(ref) {
                return ref.indexOf(organismPrefix) != -1;
            });
            if (geneRef) {
                sep = geneRef.indexOf(":") + 1;
                baseName = geneRef.substring(sep, geneRef.length);
                geneLink = baseUrl + baseName;
            }
        }

        // Set up breadcrumbs
        var assayTargets = context.investigated_as.map(function(assayTarget) {
            return 'investigated_as=' + assayTarget;
        });
        var crumbs = [
            {id: 'Targets'},
            {id: context.investigated_as.join(' + '), query: assayTargets.join('&'), tip: context.investigated_as.join(' + ')},
            {id: <i>{context.organism.scientific_name}</i>, query: 'organism.scientific_name=' + context.organism.scientific_name,
                tip: context.investigated_as.join(' + ') + ' and ' + context.organism.scientific_name}
        ];

        return (
            <div className={globals.itemClass(context, 'view-item')}>
                <header className="row">
                    <div className="col-sm-12">
                        <Breadcrumbs root='/search/?type=target' crumbs={crumbs} />
                        <h2>{context.label} (<em>{context.organism.scientific_name}</em>)</h2>
                    </div>
                </header>

                <div className="panel">
                    <dl className={itemClass}>
                        <div data-test="name">
                            <dt>Target name</dt>
                            <dd>{context.label}</dd>
                        </div>

                        {context.gene_name && geneLink ?
                            <div data-test="gene">
                                <dt>Target gene</dt>
                                <dd><a href={geneLink}>{context.gene_name}</a></dd>
                            </div>
                        : null}

                        <div data-test="external">
                            <dt>External resources</dt>
                            <dd>
                                {context.dbxref.length ?
                                    <DbxrefList values={context.dbxref} target_gene={context.gene_name} />
                                : <em>None submitted</em> }
                            </dd>
                        </div>
                    </dl>
                </div>

                <RelatedItems title={'Experiments using target ' + context.label}
                              url={'/search/?type=experiment&target.uuid=' + context.uuid}
                              Component={ExperimentTable} />
            </div>
        );
    }
});

globals.content_views.register(Target, 'Target');
