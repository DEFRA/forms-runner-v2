export default {
  grantScheme: {
    key: 'LAYINGHENS01',
    name: 'Laying Hens Grant'
  },
  desirability: {
    questions: [
      {
        key: 'poultry-type',
        answers: [
          {
            key: 'poultry-type',
            title: 'What type of poultry will be housed in this building?',
            input: [
              {
                key: 'poultry-type-A1',
                value: 'Hens'
              }
            ]
          }
        ],
        rating: {
          score: 0,
          band: 'weak',
          importance: null
        }
      },
      {
        key: 'current-system',
        answers: [
          {
            key: 'current-system',
            title:
              'What type of hen housing system do you currently use in the building?',
            input: [
              {
                key: 'current-system-A3',
                value: 'Barn'
              }
            ]
          }
        ],
        rating: {
          score: 7,
          band: 'Average',
          importance: null
        }
      },
      {
        key: 'ramp-connection',
        answers: [
          {
            key: 'ramp-connection',
            title:
              'Will every level of the multi-tier system be connected to another level by a ramp?',
            input: [
              {
                key: 'ramp-connection-A2',
                value: 'No'
              }
            ]
          }
        ],
        rating: {
          score: 0,
          band: 'Weak',
          importance: null
        }
      },
      {
        key: 'maximum-tier-height',
        answers: [
          {
            key: 'maximum-tier-height',
            title:
              'Will the highest tier with direct access to the floor be 2 metres high or less?',
            input: [
              {
                key: 'maximum-tier-height-A1',
                value: 'Yes'
              }
            ]
          }
        ],
        rating: {
          score: 5,
          band: 'Strong',
          importance: null
        }
      },
      {
        key: 'tier-number',
        answers: [
          {
            key: 'tier-number',
            title:
              'How many tiers will be positioned directly above each other in the {{_poultryType_}} system?',
            input: [
              {
                key: 'tier-number-A1',
                value: '3 tiers or fewer'
              }
            ]
          }
        ],
        rating: {
          score: 5,
          band: 'Strong',
          importance: null
        }
      },
      {
        key: 'hen-multi-tier',
        answers: [
          {
            key: 'hen-multi-tier',
            title:
              'Will the hens in your grant-funded building be reared in a multi-tier system as pullets?',
            input: [
              {
                key: 'hen-multi-tier-A1',
                value: 'Yes'
              }
            ]
          }
        ],
        rating: {
          score: 10,
          band: 'Strong',
          importance: null
        }
      },
      {
        key: 'natural-light',
        answers: [
          {
            key: 'natural-light',
            title:
              'Will the building have windows that provide natural light to the indoor housing?',
            input: [
              {
                key: 'natural-light-A2',
                value: 'No'
              }
            ]
          }
        ],
        rating: {
          score: 0,
          band: 'Weak',
          importance: null
        }
      },
      {
        key: 'easy-grip-perches',
        answers: [
          {
            key: 'easy-grip-perches',
            title:
              'Will the perches have a design feature that help the hens grip the perches?',
            input: [
              {
                key: 'easy-grip-perches-A1',
                value: 'Yes'
              }
            ]
          }
        ],
        rating: {
          score: 15,
          band: 'Strong',
          importance: null
        }
      },
      {
        key: 'building-biosecurity',
        answers: [
          {
            key: 'building-biosecurity',
            title: 'Will the building structure include the following?',
            input: [
              {
                key: 'building-biosecurity-A1',
                value: 'Shower facilities in the biosecurity changing area'
              }
            ]
          }
        ],
        rating: {
          score: 7,
          band: 'Strong',
          importance: null
        }
      },
      {
        key: 'pollution-mitigation',
        answers: [
          {
            key: 'pollution-mitigation',
            title: 'Will the building have any of the following?',
            input: [
              {
                key: 'pollution-mitigation-A1',
                value: 'Manure drying'
              }
            ]
          }
        ],
        rating: {
          score: 7,
          band: 'Strong',
          importance: null
        }
      },
      {
        key: 'renewable-energy',
        answers: [
          {
            key: 'renewable-energy',
            title: 'Will the hen housing use renewable energy sources?',
            input: [
              {
                key: 'renewable-energy-A1',
                value: 'Solar PV system'
              }
            ]
          }
        ],
        rating: {
          score: 5,
          band: 'Average',
          importance: null
        }
      },
      {
        key: 'bird-data-type',
        answers: [
          {
            key: 'bird-data-type',
            title:
              'What poultry management data will you automatically collect and store?',
            input: [
              {
                key: 'bird-data-type-A1',
                value: 'Bird location'
              }
            ]
          }
        ],
        rating: {
          score: 8,
          band: 'Average',
          importance: null
        }
      },
      {
        key: 'environmental-data-type',
        answers: [
          {
            key: 'environmental-data-type',
            title:
              'What additional environmental data will you automatically collect and store?',
            input: [
              {
                key: 'environmental-data-type-A1',
                value: 'Ammonia'
              }
            ]
          }
        ],
        rating: {
          score: 8,
          band: 'Average',
          importance: null
        }
      }
    ],
    overallRating: {
      score: 26.73,
      band: 'Weak'
    }
  }
}
