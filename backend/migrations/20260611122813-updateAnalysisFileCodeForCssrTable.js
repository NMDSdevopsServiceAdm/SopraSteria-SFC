'use strict';

const analysisFileCodeForCssr = [
  { AnalysisFileCode: 104, Cssr: 'Northumberland' },
  { AnalysisFileCode: 106, Cssr: 'Gateshead' },
  { AnalysisFileCode: 107, Cssr: 'Newcastle upon Tyne' },
  { AnalysisFileCode: 108, Cssr: 'North Tyneside' },
  { AnalysisFileCode: 109, Cssr: 'South Tyneside' },
  { AnalysisFileCode: 110, Cssr: 'Sunderland' },
  { AnalysisFileCode: 111, Cssr: 'Hartlepool' },
  { AnalysisFileCode: 112, Cssr: 'Middlesbrough' },
  { AnalysisFileCode: 113, Cssr: 'Redcar & Cleveland' },
  { AnalysisFileCode: 114, Cssr: 'Stockton on Tees' },
  { AnalysisFileCode: 116, Cssr: 'Durham' },
  { AnalysisFileCode: 117, Cssr: 'Darlington' },
  { AnalysisFileCode: 118, Cssr: 'Cumberland' },
  { AnalysisFileCode: 119, Cssr: 'Westmorland and Furness' },

  { AnalysisFileCode: 204, Cssr: 'Barnsley' },
  { AnalysisFileCode: 205, Cssr: 'Doncaster' },
  { AnalysisFileCode: 206, Cssr: 'Rotherham' },
  { AnalysisFileCode: 207, Cssr: 'Sheffield' },
  { AnalysisFileCode: 209, Cssr: 'Bradford' },
  { AnalysisFileCode: 210, Cssr: 'Calderdale' },
  { AnalysisFileCode: 211, Cssr: 'Kirklees' },
  { AnalysisFileCode: 212, Cssr: 'Leeds' },
  { AnalysisFileCode: 213, Cssr: 'Wakefield' },
  { AnalysisFileCode: 214, Cssr: 'East Riding of Yorkshire' },
  { AnalysisFileCode: 215, Cssr: 'Kingston upon Hull' },
  { AnalysisFileCode: 216, Cssr: 'North East Lincolnshire' },
  { AnalysisFileCode: 217, Cssr: 'North Lincolnshire' },
  { AnalysisFileCode: 218, Cssr: 'North Yorkshire' },
  { AnalysisFileCode: 219, Cssr: 'York' },

  { AnalysisFileCode: 304, Cssr: 'Bolton' },
  { AnalysisFileCode: 305, Cssr: 'Bury' },
  { AnalysisFileCode: 306, Cssr: 'Manchester' },
  { AnalysisFileCode: 307, Cssr: 'Oldham' },
  { AnalysisFileCode: 308, Cssr: 'Rochdale' },
  { AnalysisFileCode: 309, Cssr: 'Salford' },
  { AnalysisFileCode: 310, Cssr: 'Stockport' },
  { AnalysisFileCode: 311, Cssr: 'Tameside' },
  { AnalysisFileCode: 312, Cssr: 'Trafford' },
  { AnalysisFileCode: 313, Cssr: 'Wigan' },
  { AnalysisFileCode: 315, Cssr: 'Knowsley' },
  { AnalysisFileCode: 316, Cssr: 'Liverpool' },
  { AnalysisFileCode: 317, Cssr: 'Sefton' },
  { AnalysisFileCode: 318, Cssr: 'St Helens' },
  { AnalysisFileCode: 319, Cssr: 'Wirral' },
  { AnalysisFileCode: 320, Cssr: 'Halton' },
  { AnalysisFileCode: 322, Cssr: 'Warrington' },
  { AnalysisFileCode: 323, Cssr: 'Lancashire' },
  { AnalysisFileCode: 324, Cssr: 'Blackburn with Darwen' },
  { AnalysisFileCode: 325, Cssr: 'Blackpool' },

  { AnalysisFileCode: 404, Cssr: 'Warwickshire' },
  { AnalysisFileCode: 406, Cssr: 'Birmingham' },
  { AnalysisFileCode: 407, Cssr: 'Coventry' },
  { AnalysisFileCode: 408, Cssr: 'Dudley' },
  { AnalysisFileCode: 409, Cssr: 'Sandwell' },
  { AnalysisFileCode: 410, Cssr: 'Solihull' },
  { AnalysisFileCode: 411, Cssr: 'Walsall' },
  { AnalysisFileCode: 412, Cssr: 'Wolverhampton' },
  { AnalysisFileCode: 413, Cssr: 'Staffordshire' },
  { AnalysisFileCode: 414, Cssr: 'Stoke on Trent' },
  { AnalysisFileCode: 415, Cssr: 'Herefordshire' },
  { AnalysisFileCode: 416, Cssr: 'Worcestershire' },
  { AnalysisFileCode: 417, Cssr: 'Shropshire' },
  { AnalysisFileCode: 418, Cssr: 'Telford & Wrekin' },

  { AnalysisFileCode: 503, Cssr: 'Lincolnshire' },
  { AnalysisFileCode: 504, Cssr: 'Northamptonshire' },
  { AnalysisFileCode: 506, Cssr: 'Derbyshire' },
  { AnalysisFileCode: 507, Cssr: 'Derby' },
  { AnalysisFileCode: 508, Cssr: 'Leicestershire' },
  { AnalysisFileCode: 509, Cssr: 'Leicester' },
  { AnalysisFileCode: 510, Cssr: 'Rutland' },
  { AnalysisFileCode: 511, Cssr: 'Nottinghamshire' },
  { AnalysisFileCode: 512, Cssr: 'Nottingham' },

  { AnalysisFileCode: 606, Cssr: 'Hertfordshire' },
  { AnalysisFileCode: 607, Cssr: 'Norfolk' },
  { AnalysisFileCode: 608, Cssr: 'Oxfordshire' },
  { AnalysisFileCode: 609, Cssr: 'Suffolk' },
  { AnalysisFileCode: 610, Cssr: 'Luton' },
  { AnalysisFileCode: 612, Cssr: 'Buckinghamshire' },
  { AnalysisFileCode: 613, Cssr: 'Milton Keynes' },
  { AnalysisFileCode: 614, Cssr: 'Bracknell Forest' },
  { AnalysisFileCode: 615, Cssr: 'West Berkshire' },
  { AnalysisFileCode: 616, Cssr: 'Reading' },
  { AnalysisFileCode: 617, Cssr: 'Slough' },
  { AnalysisFileCode: 618, Cssr: 'Windsor & Maidenhead' },
  { AnalysisFileCode: 619, Cssr: 'Wokingham' },
  { AnalysisFileCode: 620, Cssr: 'Essex' },
  { AnalysisFileCode: 621, Cssr: 'Southend on Sea' },
  { AnalysisFileCode: 622, Cssr: 'Thurrock' },
  { AnalysisFileCode: 623, Cssr: 'Cambridgeshire' },
  { AnalysisFileCode: 624, Cssr: 'Peterborough' },

  { AnalysisFileCode: 702, Cssr: 'Camden' },
  { AnalysisFileCode: 703, Cssr: 'Greenwich' },
  { AnalysisFileCode: 704, Cssr: 'Hackney' },
  { AnalysisFileCode: 705, Cssr: 'Hammersmith & Fulham' },
  { AnalysisFileCode: 706, Cssr: 'Islington' },
  { AnalysisFileCode: 707, Cssr: 'Kensington & Chelsea' },
  { AnalysisFileCode: 708, Cssr: 'Lambeth' },
  { AnalysisFileCode: 709, Cssr: 'Lewisham' },
  { AnalysisFileCode: 710, Cssr: 'Southwark' },
  { AnalysisFileCode: 711, Cssr: 'Tower Hamlets' },
  { AnalysisFileCode: 712, Cssr: 'Wandsworth' },
  { AnalysisFileCode: 713, Cssr: 'Westminster' },
  { AnalysisFileCode: 714, Cssr: 'City of London' },
  { AnalysisFileCode: 716, Cssr: 'Barking & Dagenham' },
  { AnalysisFileCode: 717, Cssr: 'Barnet' },
  { AnalysisFileCode: 718, Cssr: 'Bexley' },
  { AnalysisFileCode: 719, Cssr: 'Brent' },
  { AnalysisFileCode: 720, Cssr: 'Bromley' },
  { AnalysisFileCode: 721, Cssr: 'Croydon' },
  { AnalysisFileCode: 722, Cssr: 'Ealing' },
  { AnalysisFileCode: 723, Cssr: 'Enfield' },
  { AnalysisFileCode: 724, Cssr: 'Haringey' },
  { AnalysisFileCode: 725, Cssr: 'Harrow' },
  { AnalysisFileCode: 726, Cssr: 'Havering' },
  { AnalysisFileCode: 727, Cssr: 'Hillingdon' },
  { AnalysisFileCode: 728, Cssr: 'Hounslow' },
  { AnalysisFileCode: 729, Cssr: 'Kingston upon Thames' },
  { AnalysisFileCode: 730, Cssr: 'Merton' },
  { AnalysisFileCode: 731, Cssr: 'Newham' },
  { AnalysisFileCode: 732, Cssr: 'Redbridge' },
  { AnalysisFileCode: 733, Cssr: 'Richmond upon Thames' },
  { AnalysisFileCode: 734, Cssr: 'Sutton' },
  { AnalysisFileCode: 735, Cssr: 'Waltham Forest' },

  { AnalysisFileCode: 803, Cssr: 'Isle of Wight' },
  { AnalysisFileCode: 805, Cssr: 'Surrey' },
  { AnalysisFileCode: 807, Cssr: 'West Sussex' },
  { AnalysisFileCode: 809, Cssr: 'Dorset' },
  { AnalysisFileCode: 812, Cssr: 'Hampshire' },
  { AnalysisFileCode: 813, Cssr: 'Portsmouth' },
  { AnalysisFileCode: 814, Cssr: 'Southampton' },
  { AnalysisFileCode: 815, Cssr: 'East Sussex' },
  { AnalysisFileCode: 816, Cssr: 'Brighton & Hove' },
  { AnalysisFileCode: 817, Cssr: 'Wiltshire' },
  { AnalysisFileCode: 819, Cssr: 'Swindon' },
  { AnalysisFileCode: 820, Cssr: 'Kent' },
  { AnalysisFileCode: 821, Cssr: 'Medway' },
  { AnalysisFileCode: 822, Cssr: 'Bournemouth, Christchurch and Poole' },

  { AnalysisFileCode: 902, Cssr: 'Cornwall' },
  { AnalysisFileCode: 904, Cssr: 'Gloucestershire' },
  { AnalysisFileCode: 905, Cssr: 'Somerset' },
  { AnalysisFileCode: 906, Cssr: 'Isles of Scilly' },
  { AnalysisFileCode: 908, Cssr: 'Bath and North East Somerset' },
  { AnalysisFileCode: 909, Cssr: 'Bristol' },
  { AnalysisFileCode: 998, Cssr: 'Cheshire East' },
  { AnalysisFileCode: 999, Cssr: 'Cheshire West & Chester' },

  { AnalysisFileCode: 996, Cssr: 'Bedford' },
  { AnalysisFileCode: 997, Cssr: 'Central Bedfordshire' },
  { AnalysisFileCode: 912, Cssr: 'Devon' },
  { AnalysisFileCode: 910, Cssr: 'North Somerset' },
  { AnalysisFileCode: 913, Cssr: 'Plymouth' },
  { AnalysisFileCode: 911, Cssr: 'South Gloucestershire' },
  { AnalysisFileCode: 914, Cssr: 'Torbay' },
];

module.exports = {
  async up(queryInterface) {
    const caseStatement = analysisFileCodeForCssr
      .map(({ AnalysisFileCode, Cssr }) => `WHEN '${Cssr.replace(/'/g, "''")}' THEN ${AnalysisFileCode}`)
      .join('\n');

    return queryInterface.sequelize.query(`
  UPDATE cqc."Cssr"
  SET "AnalysisFileCode" = CASE "CssR"
    ${caseStatement}
  END
  WHERE "CssR" IN (
    ${analysisFileCodeForCssr.map(({ Cssr }) => `'${Cssr.replace(/'/g, "''")}'`).join(', ')}
  );
`);
  },

  async down(queryInterface) {
    return queryInterface.sequelize.query(`
      UPDATE cqc."Cssr"
      SET "AnalysisFileCode" = NULL
      WHERE "CssR" IN (
        ${analysisFileCodeForCssr.map(({ Cssr }) => `'${Cssr.replace(/'/g, "''")}'`).join(', ')}
      );
    `);
  },
};
