from snowfort import upgrade_step
from .shared import ENCODE2_AWARDS, REFERENCES_UUID
import re
from pyramid.traversal import find_root
from uuid import UUID


@upgrade_step('human_donor', '', '2')
@upgrade_step('mouse_donor', '', '2')
def donor_0_2(value, system):
    # http://redmine.encodedcc.org/issues/1295
    # http://redmine.encodedcc.org/issues/1307

    if 'status' in value:
        if value['status'] == 'DELETED':
            value['status'] = 'deleted'
        elif value['status'] == 'CURRENT':
            if value['award'] in ENCODE2_AWARDS:
                value['status'] = 'released'
            elif value['award'] not in ENCODE2_AWARDS:
                value['status'] = 'in progress'


@upgrade_step('mouse_donor', '2', '3')
def mouse_donor_2_3(value, system):
    # http://encode.stanford.edu/issues/1131

    remove_properties = [
        'sex',
        'parents',
        'children',
        'siblings',
        'fraternal_twin',
        'identical_twin'
    ]

    for remove_property in remove_properties:
        if remove_property in value:
            del value[remove_property]


@upgrade_step('human_donor', '2', '3')
def human_donor_2_3(value, system):
    # http://encode.stanford.edu/issues/1596
    if 'age' in value:
        age = value['age']
        if re.match('\d+.0(-\d+.0)?', age):
            new_age = age.replace('.0', '')
            value['age'] = new_age


@upgrade_step('human_donor', '3', '4')
@upgrade_step('mouse_donor', '3', '4')
def donor_2_3(value, system):
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


@upgrade_step('human_donor', '4', '5')
@upgrade_step('mouse_donor', '4', '5')
def human_mouse_donor_4_5(value, system):
    # http://redmine.encodedcc.org/issues/3063
    if 'aliases' in value:
        unique_aliases = set(value['aliases'])
        value['aliases'] = list(unique_aliases)

    if 'dbxrefs' in value:
        unique_dbxrefs = set(value['dbxrefs'])
        value['dbxrefs'] = list(unique_dbxrefs)

    if 'references' in value:
        unique_refs = set(value['references'])
        value['references'] = list(unique_refs)

    if 'littermates' in value:
        unique_litter = set(value['littermates'])
        value['littermates'] = list(unique_litter)

    if 'parents' in value:
        unique_parents = set(value['parents'])
        value['parents'] = list(unique_parents)

    if 'children' in value:
        unique_children = set(value['children'])
        value['children'] = list(unique_children)

    if 'siblings' in value:
        unique_siblings = set(value['siblings'])
        value['siblings'] = list(unique_siblings)


@upgrade_step('fly_donor', '1', '2')
@upgrade_step('worm_donor', '1', '2')
def fly_worm_donor_1_2(value, system):
    # http://redmine.encodedcc.org/issues/3063
    if 'aliases' in value:
        value['aliases'] = list(set(value['aliases']))

    if 'documents' in value:
        value['documents'] = list(set(value['documents']))

    if 'dbxrefs' in value:
        value['dbxrefs'] = list(set(value['dbxrefs']))

    if 'constructs' in value:
        value['constructs'] = list(set(value['constructs']))
