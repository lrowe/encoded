from pyramid.traversal import find_root
from uuid import UUID
from snowfort import upgrade_step
import re
from .shared import ENCODE2_AWARDS, REFERENCES_UUID


@upgrade_step('experiment', '', '2')
@upgrade_step('annotation', '', '2')
@upgrade_step('matched_set', '', '2')
@upgrade_step('project', '', '2')
@upgrade_step('publication_data', '', '2')
@upgrade_step('reference', '', '2')
@upgrade_step('ucsc_browser_composite', '', '2')
def dataset_0_2(value, system):
    # http://redmine.encodedcc.org/issues/650
    context = system['context']
    root = find_root(context)
    if 'files' in value:
        value['related_files'] = []
        for file_uuid in value['files']:
            item = root.get_by_uuid(file_uuid)
            if UUID(item.properties['dataset']) != context.uuid:
                value['related_files'].append(file_uuid)
        del value['files']


@upgrade_step('experiment', '2', '3')
@upgrade_step('annotation', '2', '3')
@upgrade_step('matched_set', '2', '3')
@upgrade_step('project', '2', '3')
@upgrade_step('publication_data', '2', '3')
@upgrade_step('reference', '2', '3')
@upgrade_step('ucsc_browser_composite', '2', '3')
def dataset_2_3(value, system):
    # http://redmine.encodedcc.org/issues/817
    value['dbxrefs'] = []

    if 'encode2_dbxrefs' in value:
        for encode2_dbxref in value['encode2_dbxrefs']:
            if re.match('.*wgEncodeEH.*', encode2_dbxref):
                new_dbxref = 'UCSC-ENCODE-hg19:' + encode2_dbxref
            elif re.match('.*wgEncodeEM.*', encode2_dbxref):
                new_dbxref = 'UCSC-ENCODE-mm9:' + encode2_dbxref
            value['dbxrefs'].append(new_dbxref)
        del value['encode2_dbxrefs']

    if 'geo_dbxrefs' in value:
        for geo_dbxref in value['geo_dbxrefs']:
            new_dbxref = 'GEO:' + geo_dbxref
            value['dbxrefs'].append(new_dbxref)
        del value['geo_dbxrefs']

    if 'aliases' in value:
        for alias in value['aliases']:
            if re.match('ucsc_encode_db:hg19-', alias):
                new_dbxref = alias.replace('ucsc_encode_db:hg19-', 'UCSC-GB-hg19:')
            elif re.match('ucsc_encode_db:mm9-', alias):
                new_dbxref = alias.replace('ucsc_encode_db:mm9-', 'UCSC-GB-mm9:')
            elif re.match('.*wgEncodeEH.*', alias):
                new_dbxref = alias.replace('ucsc_encode_db:', 'UCSC-ENCODE-hg19:')
            elif re.match('.*wgEncodeEM.*', alias):
                new_dbxref = alias.replace('ucsc_encode_db:', 'UCSC-ENCODE-mm9:')
            else:
                continue
            value['dbxrefs'].append(new_dbxref)
            value['aliases'].remove(alias)


@upgrade_step('experiment', '3', '4')
@upgrade_step('annotation', '3', '4')
@upgrade_step('matched_set', '3', '4')
@upgrade_step('project', '3', '4')
@upgrade_step('publication_data', '3', '4')
@upgrade_step('reference', '3', '4')
@upgrade_step('ucsc_browser_composite', '3', '4')
def dataset_3_4(value, system):
    # http://redmine.encodedcc.org/issues/1074
    if 'status' in value:
        if value['status'] == 'DELETED':
            value['status'] = 'deleted'
        elif value['status'] == 'CURRENT':
            if value['award'] in ENCODE2_AWARDS:
                value['status'] = 'released'
            elif value['award'] not in ENCODE2_AWARDS:
                value['status'] = 'submitted'

    else:
        if value['award'] in ENCODE2_AWARDS:
            value['status'] = 'released'
        elif value['award'] not in ENCODE2_AWARDS:
            value['status'] = 'submitted'


@upgrade_step('experiment', '4', '5')
@upgrade_step('annotation', '4', '5')
@upgrade_step('matched_set', '4', '5')
@upgrade_step('project', '4', '5')
@upgrade_step('publication_data', '4', '5')
@upgrade_step('reference', '4', '5')
@upgrade_step('ucsc_browser_composite', '4', '5')
def experiment_4_5(value, system):
    # http://redmine.encodedcc.org/issues/1393
    if value.get('biosample_type') == 'primary cell line':
        value['biosample_type'] = 'primary cell'


@upgrade_step('experiment', '5', '6')
@upgrade_step('annotation', '5', '6')
@upgrade_step('matched_set', '5', '6')
@upgrade_step('project', '5', '6')
@upgrade_step('publication_data', '5', '6')
@upgrade_step('reference', '5', '6')
@upgrade_step('ucsc_browser_composite', '5', '6')
def experiment_5_6(value, system):
    # http://redmine.encodedcc.org/issues/2591
    context = system['context']
    root = find_root(context)
    publications = root['publications']
    if 'references' in value:
        new_references = []
        for ref in value['references']:
            if re.match('doi', ref):
                new_references.append(REFERENCES_UUID[ref])
            else:
                item = publications[ref]
                new_references.append(str(item.uuid))
        value['references'] = new_references


@upgrade_step('experiment', '6', '7')
@upgrade_step('annotation', '6', '7')
@upgrade_step('matched_set', '6', '7')
@upgrade_step('project', '6', '7')
@upgrade_step('publication_data', '6', '7')
@upgrade_step('reference', '6', '7')
@upgrade_step('ucsc_browser_composite', '6', '7')
def dataset_6_7(value, system):
    if 'dataset_type' in value:
        if value['dataset_type'] == 'paired set':
            value.pop('related_files', None)
            value.pop('contributing_files', None)
            value.pop('revoked_files', None)
            value['related_datasets'] = []
        del value['dataset_type']


@upgrade_step('experiment', '7', '8')
@upgrade_step('annotation', '7', '8')
@upgrade_step('reference', '7', '8')
@upgrade_step('project', '7', '8')
@upgrade_step('publication_data', '7', '8')
@upgrade_step('ucsc_browser_composite', '7', '8')
@upgrade_step('organism_development_series', '7', '8')
@upgrade_step('reference_epigenome', '7', '8')
@upgrade_step('replication_timing_series', '7', '8')
@upgrade_step('treatment_time_series', '7', '8')
@upgrade_step('treatment_concentration_series', '7', '8')
def dataset_7_8(value, system):
    # http://redmine.encodedcc.org/issues/3063
    if 'possible_controls' in value:
        value['possible_controls'] = list(set(value['possible_controls']))

    if 'targets' in value:
        value['targets'] = list(set(value['targets']))

    if 'software_used' in value:
        value['software_used'] = list(set(value['software_used']))

    if 'dbxrefs' in value:
        value['dbxrefs'] = list(set(value['dbxrefs']))

    if 'aliases' in value:
        value['aliases'] = list(set(value['aliases']))

    if 'references' in value:
        value['references'] = list(set(value['references']))

    if 'documents' in value:
        value['documents'] = list(set(value['documents']))

    if 'related_files' in value:
        value['related_files'] = list(set(value['related_files']))
