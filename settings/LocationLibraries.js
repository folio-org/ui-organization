import React from 'react';
import PropTypes from 'prop-types';
import ControlledVocab from '@folio/stripes-smart-components/lib/ControlledVocab';
import Select from '@folio/stripes-components/lib/Select';

class LocationLibraries extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      intl: PropTypes.object.isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      institutions: PropTypes.object,
      campuses: PropTypes.object,
      locationsPerLibrary: PropTypes.object,
    }).isRequired,
  };

  static manifest = Object.freeze({
    institutions: {
      type: 'okapi',
      records: 'locinsts',
      path: 'location-units/institutions?query=cql.allRecords=1 sortby name&limit=100',
    },
    campuses: {
      type: 'okapi',
      records: 'loccamps',
      path: 'location-units/campuses?query=cql.allRecords=1 sortby name&limit=100'
    },
    locationsPerLibrary: {
      type: 'okapi',
      records: 'locations',
      path: 'locations',
    },
  });

  constructor(props) {
    super(props);
    this.connectedControlledVocab = props.stripes.connect(ControlledVocab);

    this.state = {
      institutionId: null,
      campusId: null,
    };
  }

  onChangeInstitution = (e) => {
    this.setState({ institutionId: e.target.value, campusId: null });
  }

  onChangeCampus = (e) => {
    this.setState({ campusId: e.target.value });
  }

  render() {
    const { formatMessage } = this.props.stripes.intl;

    const institutions = [];
    (((this.props.resources.institutions || {}).records || []).forEach(i => {
      institutions.push({ value: i.id, label: `${i.name} ${i.code}` });
    }));

    if (!institutions.length) {
      return <div />;
    }

    const campuses = [];
    ((this.props.resources.campuses || {}).records || []).forEach(i => {
      if (i.institutionId === this.state.institutionId) {
        campuses.push({ value: i.id, label: `${i.name} ${i.code}` });
      }
    });

    const filterBlock = (
      <div>
        <Select
          label={formatMessage({ id: 'settings.location.institutions.institution' })}
          id="institutionSelect"
          name="institutionSelect"
          dataOptions={[{ label: formatMessage({ id: 'settings.location.institutions.selectInstitution' }), value: '' }, ...institutions]}
          onChange={this.onChangeInstitution}
        />
        {this.state.institutionId && <Select
          label={formatMessage({ id: 'settings.location.institutions.selectCampus' })}
          id="campusSelect"
          name="campusSelect"
          dataOptions={[{ label: formatMessage({ id: 'settings.location.institutions.selectCampus' }), value: '' }, ...campuses]}
          onChange={this.onChangeCampus}
        />}
      </div>
    );

    return (
      <this.connectedControlledVocab
        {...this.props}
        // We have to unset the dataKey to prevent the props.resources in
        // <ControlledVocab> from being overwritten by the props.resources here.
        dataKey={undefined}
        baseUrl="location-units/libraries"
        records="loclibs"
        rowFilter={filterBlock}
        rowFilterFunction={(row) => row.campusId === this.state.campusId}
        label={this.props.stripes.intl.formatMessage({ id: 'ui-organization.settings.location.libraries.libraries' })}
        labelSingular={this.props.stripes.intl.formatMessage({ id: 'ui-organization.settings.location.libraries.library' })}
        objectLabel={this.props.stripes.intl.formatMessage({ id: 'ui-organization.settings.location.locations.locations' })}
        visibleFields={['name', 'code']}
        columnMapping={{
          name: this.props.stripes.intl.formatMessage({ id: 'ui-organization.settings.location.libraries.library' }),
          code: this.props.stripes.intl.formatMessage({ id: 'ui-organization.settings.location.code' }),
        }}
        // formatter={formatter}
        nameKey="group"
        id="patrongroups"
        preCreateHook={(item) => Object.assign({}, item, { campusId: this.state.campusId })}
      />
    );
  }
}

export default LocationLibraries;
