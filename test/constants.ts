/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { QueryError } from '../public/types/index';

export const TEST_SEARCH_TEXT = 'basic';

export const TEST_QUERY_RESPONSE = {
  took: 8,
  timed_out: false,
  _shards: {
    total: 1,
    successful: 1,
    skipped: 0,
    failed: 0,
  },
  hits: {
    total: {
      value: 10000,
      relation: 'gte',
    },
    max_score: 1,
    hits: [
      {
        _index: 'chorus-ecommerce-data',
        _id: 'WwLJC4QBuER5vZIv1tvg',
        _score: 1,
        _source: {
          arr: ['el1', 'el2', 'el3'],
          id: '3920564',
          name: '006R90321',
          title: 'Xerox 006R90321 toner cartridge Original Black 6 pc(s)',
          short_description: 'Toner (6 Per Box) for CopyCentre C65 Digital Copier',
          img_500x500:
            'http://images.icecat.biz/img/gallery_mediums/img_3920564_medium_1472618727_1445_7091.jpg',
          date_released: '2009-12-10T00:00:00Z',
          supplier: 'Xerox',
          price: 4995,
        },
      },
      {
        _index: 'chorus-ecommerce-data',
        _id: 'XALJC4QBuER5vZIv1tvh',
        _score: 1,
        _source: {
          nestObj: { key1: [1, true, null], key2: { key21: 'element' } },
          id: '2101957',
          name: 'dv7-1211ea',
          title:
            'HP Pavilion dv7-1211ea Notebook Silver 43.2 cm (17") 1440 x 900 pixels Intel® Core™2 Duo 4 GB DDR2-SDRAM 250 GB HDD NVIDIA® GeForce® 9200M GS Windows Vista Home Premium',
          short_description:
            'Intel Core 2 Duo Processor P7450 (3M Cache, 2.13 GHz, 1066 MHz FSB), 4GB DDR2, 250GB SATA HDD, 17" WXGA+ HD BrightView 1440 x 900, nVidia GeForce 9200M GS, DVD Super Multi DL, Gigabit Ethernet, WLAN 802.11 b/g, WebCam, Windows Vista Home Premium 32-bit',
          img_500x500: 'http://images.icecat.biz/img/gallery_mediums/2101957_8011415648.jpg',
          date_released: '2008-12-19T00:00:00Z',
          supplier: 'HP',
          price: 10995,
          attr_t_product_colour: 'Silver',
        },
      },
      {
        _index: 'chorus-ecommerce-data',
        _id: 'XQLJC4QBuER5vZIv1tvh',
        _score: 1,
        _source: {
          id: '1128895',
          name: 'DB9 RS232 Serial Null Modem Adapter - M/F',
          title: 'StarTech.com DB9 RS232 Serial Null Modem Adapter - M/F',
          short_description: 'StarTech.com DB9 RS232 Serial Null Modem Adapter - M/F',
          img_500x500: 'http://images.icecat.biz/img/gallery_mediums/1128895_4034494654.jpg',
          date_released: '2007-08-09T00:00:00Z',
          supplier: 'StarTech.com',
          price: 595,
          attr_t_product_colour: 'Grey',
        },
      },
      {
        _index: 'chorus-ecommerce-data',
        _id: 'XgLJC4QBuER5vZIv1tvh',
        _score: 1,
        _source: {
          id: '1449722',
          name: 'ProCurve 420 Wireless Access Point',
          title: 'HP ProCurve 420 Wireless Access Point',
          short_description:
            'Refurbished A FULL-FEATURED IEEE 802.11G SINGLE-RADIO ACCESS POINT IDEALLY',
          img_500x500:
            'http://images.icecat.biz/img/gallery_mediums/img_1449722_medium_1480997766_6498_5955.jpg',
          date_released: '2008-03-07T00:00:00Z',
          supplier: 'HP',
          price: 9495,
        },
      },
      {
        _index: 'chorus-ecommerce-data',
        _id: 'XwLJC4QBuER5vZIv1tvh',
        _score: 1,
        _source: {
          id: '1625640',
          name: '2GB SD Card',
          title: 'Integral 2GB SD Card memory card',
          short_description: '2GB SD Card',
          img_500x500:
            'http://images.icecat.biz/img/gallery_mediums/img_1625640_medium_1480990774_7102_6217.jpg',
          date_released: '2008-06-23T00:00:00Z',
          supplier: 'Integral',
          price: 1195,
        },
      },
      {
        _index: 'chorus-ecommerce-data',
        _id: 'YALJC4QBuER5vZIv1tvh',
        _score: 1,
        _source: {
          id: '2067378',
          name: 'LC51C',
          title: 'Brother LC51C Original Cyan',
          short_description: 'LC51C',
          img_500x500:
            'http://images.icecat.biz/img/gallery_mediums/img_2067378_medium_1481020819_0464_12184.jpg',
          date_released: '2009-04-08T00:00:00Z',
          supplier: 'Brother',
          price: 1795,
        },
      },
      {
        _index: 'chorus-ecommerce-data',
        _id: 'YQLJC4QBuER5vZIv1tvh',
        _score: 1,
        _source: {
          id: '636678',
          name: 'Emergency Power Off (EPO)',
          title: 'APC Emergency Power Off (EPO)',
          short_description: 'Emergency Power Off (EPO)',
          img_500x500:
            'http://images.icecat.biz/img/gallery_mediums/img_636678_medium_1480944064_4778_26509.jpg',
          date_released: '2006-11-15T00:00:00Z',
          supplier: 'APC',
          price: 69195,
          attr_t_product_colour: 'Black',
        },
      },
      {
        _index: 'chorus-ecommerce-data',
        _id: 'YgLJC4QBuER5vZIv1tvh',
        _score: 1,
        _source: {
          id: '1570809',
          name: 'IT Power Distribution Module 3 Pole 5 Wire 32A IEC309 620cm',
          title:
            'APC IT Power Distribution Module 3 Pole 5 Wire 32A IEC309 620cm power distribution unit (PDU)',
          short_description: 'IT Power Distribution Module 3 Pole 5 Wire 32A IEC309 620cm',
          img_500x500:
            'http://images.icecat.biz/img/gallery_mediums/img_1570809_medium_1480983343_7059_6217.jpg',
          date_released: '2008-04-11T00:00:00Z',
          supplier: 'APC',
          price: 53895,
        },
      },
      {
        _index: 'chorus-ecommerce-data',
        _id: 'YwLJC4QBuER5vZIv1tvh',
        _score: 1,
        _source: {
          id: '148843',
          name: 'Labels Premium A4 64.6x33.8 mm white paper matt 2400 pcs.',
          title: 'HERMA Labels Premium A4 64.6x33.8 mm white paper matt 2400 pcs.',
          short_description: 'Labels Premium A4 64.6x33.8 mm white paper matt 2400 pcs.',
          img_500x500: 'http://images.icecat.biz/img/gallery_mediums/148843_2449.jpg',
          date_released: '2005-07-15T00:00:00Z',
          supplier: 'HERMA',
          price: 3795,
          attr_t_product_colour: 'White',
        },
      },
      {
        _index: 'chorus-ecommerce-data',
        _id: 'ZALJC4QBuER5vZIv1tvh',
        _score: 1,
        _source: {
          id: '968447',
          name: "Cyan Toner Cartridge for C7100/C7300/C7500 Series 'Type C4'",
          title: "OKI Cyan Toner Cartridge for C7100/C7300/C7500 Series 'Type C4' Original",
          short_description: "Cyan Toner Cartridge for C7100/C7300/C7500 Series 'Type C4'",
          img_500x500:
            'http://images.icecat.biz/img/gallery_mediums/img_968447_medium_1480985748_8727_5647.jpg',
          date_released: '2007-08-09T00:00:00Z',
          supplier: 'OKI',
          price: 20395,
        },
      },
    ],
  },
};

export const TEST_COMPARED_DOCUMENTS_RANK = {
  WwLJC4QBuER5vZIv1tvg: 2,
  XALJC4QBuER5vZIv1tvh: 1,
  XQLJC4QBuER5vZIv1tvh: 10,
  XgLJC4QBuER5vZIv1tvh: 100,
};

export const TEST_COMPARED_DOCUMENTS_RANK_1 = {
  WwLJC4QBuER5vZIv1tvg: 10,
  XALJC4QBuER5vZIv1tvh: 100,
  XQLJC4QBuER5vZIv1tvh: 2,
  XgLJC4QBuER5vZIv1tvh: 10,
};

export const TEST_COMPARED_DOCUMENTS_RANK_2 = {
  WwLJC4QBuER5vZIv1tvg: 2,
  XALJC4QBuER5vZIv1tvh: 1,
  XQLJC4QBuER5vZIv1tvh: 10,
  XgLJC4QBuER5vZIv1tvh: 100,
};

export const TEST_QUERY_STRING = '{}';

export const TEST_QUERY_ERROR: QueryError = {
  selectIndex: '',
  queryString: '',
  errorResponse: {
    statusCode: 400,
    body: 'Error: parsing_exception - Unknown key for a VALUE_STRING in [this].',
  },
};
