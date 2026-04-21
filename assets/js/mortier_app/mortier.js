import SVGWriter from "./svg_writer.js"
import RegularTesselation from "./tesselation.js"
// Create renderer
const writer = new SVGWriter(800, 600, 40);

// Your tessellation config (example)
const tess = {
T1:[6,0,-6,0],
T2:[6,0,0,0],
Seed:[
[0,0,0,0],
[1,0,-1,0],
[2,0,-2,0],
[1,0,0,0],
[3,0,-3,0],
[2,0,-1,0],
[4,0,-4,0],
[2,0,0,0],
[5,0,-5,0],
[4,0,-3,0],
[3,0,-1,0],
[5,0,-4,0],
[3,0,0,0],
[4,0,-2,0],
[6,0,-5,0],
[5,0,-3,0],
[4,0,-1,0],
[6,0,-4,0],
[5,0,-2,0],
[4,0,0,0],
[7,0,-5,0],
[6,0,-3,0],
[5,0,-1,0],
[6,0,-2,0],
[5,0,0,0],
[8,0,-5,0],
[7,0,-3,0],
[6,0,-1,0],
[7,0,-2,0],
[8,0,-4,0],
[9,0,-5,0],
[8,0,-3,0],
[9,0,-4,0],
[10,0,-5,0]
]
};

// Create tessellation
const t = new RegularTesselation(writer, tess, "demo");

// Generate geometry
t.tesselate_face();

// Draw all faces
for (const face of t.faces) {
  writer.face(face);
}


const container = document.getElementById("app");

document.getElementById("save-as").addEventListener("click", function () {
	const svg = document.getElementById("app");

	// Clone to avoid modifying the original
	const clone = svg.cloneNode(true);

	// Ensure namespace is set
	clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

	// Serialize SVG
	const serializer = new XMLSerializer();
	let source = serializer.serializeToString(clone);

	// Add XML declaration
	if (!source.match(/^<\?xml/)) {
		source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
	}

	// Create Blob
	const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8;" });

	// Create download link
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "drawing.svg";

	document.body.appendChild(link);
	link.click();

	document.body.removeChild(link);
	URL.revokeObjectURL(url);
});

function getRGB(hex){
	var res = hex.match(/[a-f0-9]{2}/gi);
	return res && res.length === 3
		? res.map(function(v) { return parseInt(v, 16) })
		: null;
}

function choose_tess_id() {
	const tess_id = ['t1001', 't1002', 't1003', 't1004', 't1005', 't1006', 't1007', 't1008', 't1009', 't1010', 't1011', 't2001', 't2002', 't2003', 't2004', 't2005', 't2006', 't2007', 't2008', 't2009', 't2010', 't2011', 't2012', 't2013', 't2014', 't2015', 't2016', 't2017', 't2018', 't2019', 't2020', 't3001', 't3002', 't3003', 't3004', 't3005', 't3006', 't3007', 't3008', 't3009', 't3010', 't3011', 't3012', 't3013', 't3014', 't3015', 't3016', 't3017', 't3018', 't3019', 't3020', 't3021', 't3022', 't3023', 't3024', 't3025', 't3026', 't3027', 't3028', 't3029', 't3030', 't3031', 't3032', 't3033', 't3034', 't3035', 't3036', 't3037', 't3038', 't3039', 't3040', 't3041', 't3042', 't3043', 't3044', 't3045', 't3046', 't3047', 't3048', 't3049', 't3050', 't3051', 't3052', 't3053', 't3054', 't3055', 't3056', 't3057', 't3058', 't3059', 't3060', 't3061', 't3u001', 't3u002', 't3u003', 't3u004', 't3u005', 't3u006', 't3u007', 't3u008', 't3u009', 't3u010', 't3u011', 't3u012', 't3u013', 't3u014', 't3u015', 't3u016', 't3u017', 't3u018', 't3u019', 't3u020', 't3u021', 't3u022', 't3u023', 't3u024', 't3u025', 't3u026', 't3u027', 't3u028', 't3u029', 't3u030', 't3u031', 't3u032', 't3u033', 't3u034', 't3u035', 't3u036', 't3u037', 't3u038', 't3u039', 't4001', 't4002', 't4003', 't4004', 't4005', 't4006', 't4007', 't4008', 't4009', 't4010', 't4011', 't4012', 't4013', 't4014', 't4015', 't4016', 't4017', 't4018', 't4019', 't4020', 't4021', 't4022', 't4023', 't4024', 't4025', 't4026', 't4027', 't4028', 't4029', 't4030', 't4031', 't4032', 't4033', 't4034', 't4035', 't4036', 't4037', 't4038', 't4039', 't4040', 't4041', 't4042', 't4043', 't4044', 't4045', 't4046', 't4047', 't4048', 't4049', 't4050', 't4051', 't4052', 't4053', 't4054', 't4055', 't4056', 't4057', 't4058', 't4059', 't4060', 't4061', 't4062', 't4063', 't4064', 't4065', 't4066', 't4067', 't4068', 't4069', 't4070', 't4071', 't4072', 't4073', 't4074', 't4075', 't4076', 't4077', 't4078', 't4079', 't4080', 't4081', 't4082', 't4083', 't4084', 't4085', 't4086', 't4087', 't4088', 't4089', 't4090', 't4091', 't4092', 't4093', 't4094', 't4095', 't4096', 't4097', 't4098', 't4099', 't4100', 't4101', 't4102', 't4103', 't4104', 't4105', 't4106', 't4107', 't4108', 't4109', 't4110', 't4111', 't4112', 't4113', 't4114', 't4115', 't4116', 't4117', 't4118', 't4119', 't4120', 't4121', 't4122', 't4123', 't4124', 't4125', 't4126', 't4127', 't4128', 't4129', 't4130', 't4131', 't4132', 't4133', 't4134', 't4135', 't4136', 't4137', 't4138', 't4139', 't4140', 't4141', 't4142', 't4143', 't4144', 't4145', 't4146', 't4147', 't4148', 't4149', 't4150', 't4151', 't4u001', 't4u002', 't4u003', 't4u004', 't4u005', 't4u006', 't4u007', 't4u008', 't4u009', 't4u010', 't4u011', 't4u012', 't4u013', 't4u014', 't4u015', 't4u016', 't4u017', 't4u018', 't4u019', 't4u020', 't4u021', 't4u022', 't4u023', 't4u024', 't4u025', 't4u026', 't4u027', 't4u028', 't4u029', 't4u030', 't4u031', 't4u032', 't4u033', 't5001', 't5002', 't5003', 't5004', 't5005', 't5006', 't5007', 't5008', 't5009', 't5010', 't5011', 't5012', 't5013', 't5014', 't5015', 't5016', 't5017', 't5018', 't5019', 't5020', 't5021', 't5022', 't5023', 't5024', 't5025', 't5026', 't5027', 't5028', 't5029', 't5030', 't5031', 't5032', 't5033', 't5034', 't5035', 't5036', 't5037', 't5038', 't5039', 't5040', 't5041', 't5042', 't5043', 't5044', 't5045', 't5046', 't5047', 't5048', 't5049', 't5050', 't5051', 't5052', 't5053', 't5054', 't5055', 't5056', 't5057', 't5058', 't5059', 't5060', 't5061', 't5062', 't5063', 't5064', 't5065', 't5066', 't5067', 't5068', 't5069', 't5070', 't5071', 't5072', 't5073', 't5074', 't5075', 't5076', 't5077', 't5078', 't5079', 't5080', 't5081', 't5082', 't5083', 't5084', 't5085', 't5086', 't5087', 't5088', 't5089', 't5090', 't5091', 't5092', 't5093', 't5094', 't5095', 't5096', 't5097', 't5098', 't5099', 't5100', 't5101', 't5102', 't5103', 't5104', 't5105', 't5106', 't5107', 't5108', 't5109', 't5110', 't5111', 't5112', 't5113', 't5114', 't5115', 't5116', 't5117', 't5118', 't5119', 't5120', 't5121', 't5122', 't5123', 't5124', 't5125', 't5126', 't5127', 't5128', 't5129', 't5130', 't5131', 't5132', 't5133', 't5134', 't5135', 't5136', 't5137', 't5138', 't5139', 't5140', 't5141', 't5142', 't5143', 't5144', 't5145', 't5146', 't5147', 't5148', 't5149', 't5150', 't5151', 't5152', 't5153', 't5154', 't5155', 't5156', 't5157', 't5158', 't5159', 't5160', 't5161', 't5162', 't5163', 't5164', 't5165', 't5166', 't5167', 't5168', 't5169', 't5170', 't5171', 't5172', 't5173', 't5174', 't5175', 't5176', 't5177', 't5178', 't5179', 't5180', 't5181', 't5182', 't5183', 't5184', 't5185', 't5186', 't5187', 't5188', 't5189', 't5190', 't5191', 't5192', 't5193', 't5194', 't5195', 't5196', 't5197', 't5198', 't5199', 't5200', 't5201', 't5202', 't5203', 't5204', 't5205', 't5206', 't5207', 't5208', 't5209', 't5210', 't5211', 't5212', 't5213', 't5214', 't5215', 't5216', 't5217', 't5218', 't5219', 't5220', 't5221', 't5222', 't5223', 't5224', 't5225', 't5226', 't5227', 't5228', 't5229', 't5230', 't5231', 't5232', 't5233', 't5234', 't5235', 't5236', 't5237', 't5238', 't5239', 't5240', 't5241', 't5242', 't5243', 't5244', 't5245', 't5246', 't5247', 't5248', 't5249', 't5250', 't5251', 't5252', 't5253', 't5254', 't5255', 't5256', 't5257', 't5258', 't5259', 't5260', 't5261', 't5262', 't5263', 't5264', 't5265', 't5266', 't5267', 't5268', 't5269', 't5270', 't5271', 't5272', 't5273', 't5274', 't5275', 't5276', 't5277', 't5278', 't5279', 't5280', 't5281', 't5282', 't5283', 't5284', 't5285', 't5286', 't5287', 't5288', 't5289', 't5290', 't5291', 't5292', 't5293', 't5294', 't5295', 't5296', 't5297', 't5298', 't5299', 't5300', 't5301', 't5302', 't5303', 't5304', 't5305', 't5306', 't5307', 't5308', 't5309', 't5310', 't5311', 't5312', 't5313', 't5314', 't5315', 't5316', 't5317', 't5318', 't5319', 't5320', 't5321', 't5322', 't5323', 't5324', 't5325', 't5326', 't5327', 't5328', 't5329', 't5330', 't5331', 't5332', 't5u001', 't5u002', 't5u003', 't5u004', 't5u005', 't5u006', 't5u007', 't5u008', 't5u009', 't5u010', 't5u011', 't5u012', 't5u013', 't5u014', 't5u015', 't6001', 't6002', 't6003', 't6004', 't6005', 't6006', 't6007', 't6008', 't6009', 't6010', 't6011', 't6012', 't6013', 't6014', 't6015', 't6016', 't6017', 't6018', 't6019', 't6020', 't6021', 't6022', 't6023', 't6024', 't6025', 't6026', 't6027', 't6028', 't6029', 't6030', 't6031', 't6032', 't6033', 't6034', 't6035', 't6036', 't6037', 't6038', 't6039', 't6040', 't6041', 't6042', 't6043', 't6044', 't6045', 't6046', 't6047', 't6048', 't6049', 't6050', 't6051', 't6052', 't6053', 't6054', 't6055', 't6056', 't6057', 't6058', 't6059', 't6060', 't6061', 't6062', 't6063', 't6064', 't6065', 't6066', 't6067', 't6068', 't6069', 't6070', 't6071', 't6072', 't6073', 't6074', 't6075', 't6076', 't6077', 't6078', 't6079', 't6080', 't6081', 't6082', 't6083', 't6084', 't6085', 't6086', 't6087', 't6088', 't6089', 't6090', 't6091', 't6092', 't6093', 't6094', 't6095', 't6096', 't6097', 't6098', 't6099', 't6100', 't6101', 't6102', 't6103', 't6104', 't6105', 't6106', 't6107', 't6108', 't6109', 't6110', 't6111', 't6112', 't6113', 't6114', 't6115', 't6116', 't6117', 't6118', 't6119', 't6120', 't6121', 't6122', 't6123', 't6124', 't6125', 't6126', 't6127', 't6128', 't6129', 't6130', 't6131', 't6132', 't6133', 't6134', 't6135', 't6136', 't6137', 't6138', 't6139', 't6140', 't6141', 't6142', 't6143', 't6144', 't6145', 't6146', 't6147', 't6148', 't6149', 't6150', 't6151', 't6152', 't6153', 't6154', 't6155', 't6156', 't6157', 't6158', 't6159', 't6160', 't6161', 't6162', 't6163', 't6164', 't6165', 't6166', 't6167', 't6168', 't6169', 't6170', 't6171', 't6172', 't6173', 't6174', 't6175', 't6176', 't6177', 't6178', 't6179', 't6180', 't6181', 't6182', 't6183', 't6184', 't6185', 't6186', 't6187', 't6188', 't6189', 't6190', 't6191', 't6192', 't6193', 't6194', 't6195', 't6196', 't6197', 't6198', 't6199', 't6200', 't6201', 't6202', 't6203', 't6204', 't6205', 't6206', 't6207', 't6208', 't6209', 't6210', 't6211', 't6212', 't6213', 't6214', 't6215', 't6216', 't6217', 't6218', 't6219', 't6220', 't6221', 't6222', 't6223', 't6224', 't6225', 't6226', 't6227', 't6228', 't6229', 't6230', 't6231', 't6232', 't6233', 't6234', 't6235', 't6236', 't6237', 't6238', 't6239', 't6240', 't6241', 't6242', 't6243', 't6244', 't6245', 't6246', 't6247', 't6248', 't6249', 't6250', 't6251', 't6252', 't6253', 't6254', 't6255', 't6256', 't6257', 't6258', 't6259', 't6260', 't6261', 't6262', 't6263', 't6264', 't6265', 't6266', 't6267', 't6268', 't6269', 't6270', 't6271', 't6272', 't6273', 't6274', 't6275', 't6276', 't6277', 't6278', 't6279', 't6280', 't6281', 't6282', 't6283', 't6284', 't6285', 't6286', 't6287', 't6288', 't6289', 't6290', 't6291', 't6292', 't6293', 't6294', 't6295', 't6296', 't6297', 't6298', 't6299', 't6300', 't6301', 't6302', 't6303', 't6304', 't6305', 't6306', 't6307', 't6308', 't6309', 't6310', 't6311', 't6312', 't6313', 't6314', 't6315', 't6316', 't6317', 't6318', 't6319', 't6320', 't6321', 't6322', 't6323', 't6324', 't6325', 't6326', 't6327', 't6328', 't6329', 't6330', 't6331', 't6332', 't6333', 't6334', 't6335', 't6336', 't6337', 't6338', 't6339', 't6340', 't6341', 't6342', 't6343', 't6344', 't6345', 't6346', 't6347', 't6348', 't6349', 't6350', 't6351', 't6352', 't6353', 't6354', 't6355', 't6356', 't6357', 't6358', 't6359', 't6360', 't6361', 't6362', 't6363', 't6364', 't6365', 't6366', 't6367', 't6368', 't6369', 't6370', 't6371', 't6372', 't6373', 't6374', 't6375', 't6376', 't6377', 't6378', 't6379', 't6380', 't6381', 't6382', 't6383', 't6384', 't6385', 't6386', 't6387', 't6388', 't6389', 't6390', 't6391', 't6392', 't6393', 't6394', 't6395', 't6396', 't6397', 't6398', 't6399', 't6400', 't6401', 't6402', 't6403', 't6404', 't6405', 't6406', 't6407', 't6408', 't6409', 't6410', 't6411', 't6412', 't6413', 't6414', 't6415', 't6416', 't6417', 't6418', 't6419', 't6420', 't6421', 't6422', 't6423', 't6424', 't6425', 't6426', 't6427', 't6428', 't6429', 't6430', 't6431', 't6432', 't6433', 't6434', 't6435', 't6436', 't6437', 't6438', 't6439', 't6440', 't6441', 't6442', 't6443', 't6444', 't6445', 't6446', 't6447', 't6448', 't6449', 't6450', 't6451', 't6452', 't6453', 't6454', 't6455', 't6456', 't6457', 't6458', 't6459', 't6460', 't6461', 't6462', 't6463', 't6464', 't6465', 't6466', 't6467', 't6468', 't6469', 't6470', 't6471', 't6472', 't6473', 't6474', 't6475', 't6476', 't6477', 't6478', 't6479', 't6480', 't6481', 't6482', 't6483', 't6484', 't6485', 't6486', 't6487', 't6488', 't6489', 't6490', 't6491', 't6492', 't6493', 't6494', 't6495', 't6496', 't6497', 't6498', 't6499', 't6500', 't6501', 't6502', 't6503', 't6504', 't6505', 't6506', 't6507', 't6508', 't6509', 't6510', 't6511', 't6512', 't6513', 't6514', 't6515', 't6516', 't6517', 't6518', 't6519', 't6520', 't6521', 't6522', 't6523', 't6524', 't6525', 't6526', 't6527', 't6528', 't6529', 't6530', 't6531', 't6532', 't6533', 't6534', 't6535', 't6536', 't6537', 't6538', 't6539', 't6540', 't6541', 't6542', 't6543', 't6544', 't6545', 't6546', 't6547', 't6548', 't6549', 't6550', 't6551', 't6552', 't6553', 't6554', 't6555', 't6556', 't6557', 't6558', 't6559', 't6560', 't6561', 't6562', 't6563', 't6564', 't6565', 't6566', 't6567', 't6568', 't6569', 't6570', 't6571', 't6572', 't6573', 't6574', 't6575', 't6576', 't6577', 't6578', 't6579', 't6580', 't6581', 't6582', 't6583', 't6584', 't6585', 't6586', 't6587', 't6588', 't6589', 't6590', 't6591', 't6592', 't6593', 't6594', 't6595', 't6596', 't6597', 't6598', 't6599', 't6600', 't6601', 't6602', 't6603', 't6604', 't6605', 't6606', 't6607', 't6608', 't6609', 't6610', 't6611', 't6612', 't6613', 't6614', 't6615', 't6616', 't6617', 't6618', 't6619', 't6620', 't6621', 't6622', 't6623', 't6624', 't6625', 't6626', 't6627', 't6628', 't6629', 't6630', 't6631', 't6632', 't6633', 't6634', 't6635', 't6636', 't6637', 't6638', 't6639', 't6640', 't6641', 't6642', 't6643', 't6644', 't6645', 't6646', 't6647', 't6648', 't6649', 't6650', 't6651', 't6652', 't6653', 't6654', 't6655', 't6656', 't6657', 't6658', 't6659', 't6660', 't6661', 't6662', 't6663', 't6664', 't6665', 't6666', 't6667', 't6668', 't6669', 't6670', 't6671', 't6672', 't6673', 't6u001', 't6u002', 't6u003', 't6u004', 't6u005', 't6u006', 't6u007', 't6u008', 't6u009', 't6u010', 't7u001', 't7u002', 't7u003', 't7u004', 't7u005', 't7u006', 't7u007', 'GHLPU', 'GLMT_1', 'GLMT_2', 'GLM', 'GLP', 'GLUW', 'GM_1', 'GM_2', 'GMP', 'GMUW', 'G', 'HLMNQTU', 'HLMP', 'HLW', 'HNQT', 'HNQU', 'HNR', 'HP_1', 'HP_2', 'H', 'J', 'KNPQU_1', 'KNPQU_2', 'KNQSTU', 'KNQSU', 'KNQT', 'KNQU_1', 'KNQU_2', 'KQR_1', 'KQR_2', 'KQR_3', 'KQR_4', 'KQRV_1', 'KQRV_2', 'KQRV_3', 'KQRV_4', 'KQV_1', 'KQV_2', 'KQV_3', 'KQW_1', 'KQW_2', 'K', 'LMPTU_1', 'LMPTU_2', 'LMPUW_1', 'LMPUW_2', 'LMST', 'LMTUW_1', 'LMTUW_2', 'LMTUW_3', 'LMU', 'LMUW', 'LPNRST', 'LPT', 'LPTUW', 'LSTUW', 'LTUW', 'LTW', 'LUW_1', 'LUW_2', 'LW', 'MPU', 'MPUW', 'MUW', 'NP_1', 'NP_2', 'NP_3', 'NPQTU_1', 'NPQTU_2', 'NPQTUV', 'NPQTUW', 'NPQU', 'NPR_1', 'NPR_2', 'NPR_3', 'NPRST', 'NPRSTU', 'NPRSTUW_1', 'NPRSTUW_2', 'NPS_1', 'NPS_2', 'NPS_3', 'NPTU_1', 'NPTU_2', 'NPTUW', 'NPU_1', 'NPU_2', 'NPUW_1', 'NPUW_2', 'NQR_1', 'NQR_2', 'NQRS_1', 'NQRS_2', 'NQSU', 'NQT', 'NQTUVW', 'NQTUW', 'NQU', 'NR_1', 'NR_2', 'NRS_1', 'NRS_2', 'NRSTW', 'NRTW', 'NSTVW', 'NTV_1', 'NTV_2', 'NTVW', 'NUV', 'NUW', 'PSTUW', 'PT', 'PTU_1', 'PTU_2', 'PTU_3', 'PTU_4', 'PTU_5', 'PTU_7', 'PTUW_10', 'PTUW_11', 'PTUW_12', 'PTUW_13', 'PTUW_14', 'PTUW_15', 'PTUW_16', 'PTUW_17', 'PTUW_18', 'PTUW_1', 'PTUW_2', 'PTUW_3', 'PTUW_4', 'PTUW_5', 'PTUW_6', 'PTUW_7', 'PTUW_8', 'PTUW_9', 'PTW', 'P', 'PU_1', 'PU_2', 'PU_3', 'PU_4', 'PUW_10', 'PUW_11', 'PUW_12', 'PUW_13', 'PUW_14', 'PUW_15', 'PUW_1', 'PUW_2', 'PUW_3', 'PUW_4', 'PUW_5', 'PUW_6', 'PUW_7', 'PUW_8', 'PUW_9', 'QR', 'QRV_1', 'QRV_2', 'QRV_3', 'QRVW', 'QV', 'QVW_1', 'QVW_2', 'QVW_3', 'QW', 'R', 'RV_1', 'RV_2', 'RVW_1', 'RVW_2', 'RVW_3', 'ST', 'STU', 'STUW_1', 'STUW_2', 'STUW_3', 'STW', 'S', 'T', 'TU_1', 'TU_2', 'TU_3', 'TUV', 'TUW_10', 'TUW_11', 'TUW_12', 'TUW_13', 'TUW_14', 'TUW_15', 'TUW_1', 'TUW_2', 'TUW_3', 'TUW_4', 'TUW_5', 'TUW_6', 'TUW_7', 'TUW_8', 'TUW_9', 'TW', 'U', 'UW_1', 'UW_2', 'UW_3', 'UW_4', 'UW_5', 'V', 'VW_1', 'VW_2', 'VW_3', 'W'];
	var index = Math.floor(Math.random() * tess_id.length);
	return tess_id[index];
}

const button = document.getElementById("generate");
const label = button.querySelector(".label");

button.addEventListener("click", async () => {
	if (button.disabled) return; // extra safety
	button.disabled = true;

	const div = document.getElementById("app");
	const rect = div.getBoundingClientRect();

	const isMobile = window.innerWidth <= 768;

	const widthPx  = Math.round((isMobile ? window.innerWidth  : rect.width  - 1) * 25.4 / 96);
	const heightPx = Math.round((isMobile ? window.innerHeight * 0.8 : rect.height - 7) * 25.4 / 96);
	const sidebar = document.querySelector('.sidebar');
	const svgContainer = document.getElementById("svg-container");

	const tess_type = document.getElementById("tess-type").value;
	var tess_id   = document.getElementById("tess-id").value;
	const scale     = parseInt(document.getElementById("scale").value);
	const angle     = parseFloat(document.getElementById("angle").value);

	const n_sides = parseInt(document.getElementById("p").value);
	const n_neigh = parseInt(document.getElementById("q").value);
	const depth   = parseInt(document.getElementById("depth").value);
	const half_p  = document.getElementById("half-plane").checked;
	const ref_itr = parseInt(document.getElementById("refinements").value);

	const param = document.getElementById("parametrisation").value;

	const ornement_type     = document.getElementById("ornements").value;
	const width = parseInt(document.getElementById("bands-width").value);

	const hatch_type      = document.getElementById("hatch-type").value;
	const cross_hatch   = document.getElementById("crosshatch").value;
	const hatch_spacing = parseInt(document.getElementById("hatch-spacing").value);
	const hatch_angle= parseInt(document.getElementById("hatch-angle").value);

	const color_line = getRGB(document.getElementById("line-color").value);
	const color_map = document.getElementById("color-map").value;

	const tile = document.getElementById("tile-id").value;


	if (tess_id == "random"){
		tess_id = choose_tess_id(); 
	}

	var hatching = null
	var angle_param = null
	var ornements = null
	var colormap = null
	console.log(color_map)
	if (hatch_type != "none"){
		hatching = { 
			type: hatch_type,
			cross_hatch: cross_hatch, 
			spacing: hatch_spacing,
			angle: hatch_angle 
		};
	}
	if (param != "none"){
		angle_param = param;
	}

	if (ornement_type != "none"){
		ornements = {
			type: ornement_type,
			width: width 
		};
	}

	if (color_map != "none"){
		colormap = color_map
	}

	if (tess_type == "regular"){
		tess_parameters = {"type": tess_type,
			"tess_id": tess_id
		};
	}

	if (tess_type == "hyperbolic"){
		tess_parameters = {"type": tess_type,
			"n_sides": n_sides, 
			"n_neigh": n_neigh, 
			"depth": depth, 
			"half_plane": half_p, 
			"refinements": ref_itr
		};
	}

	if (tess_type == "penrose"){
		tess_parameters = {"type": tess_type,
			"tile": tile, 
			"depth": depth, 
		};
	}

	// fetch API...
	//	fetch("https://mortier.planch.es/tiling", {
	try { 
		const response = await fetch("https://mortier-api.onrender.com/tiling", {
		//const response = await fetch("https://mortier.planch.es/tiling", {
		//const response = await fetch("http://127.0.0.1:8000/tiling", {
			//const response = await fetch("http://localhost:8000/tiling", {
			method: "POST",
			headers: { "Content-Type": "application/json" , "Accept-Encoding": "gzip"},

			body: JSON.stringify({tess_parameters: tess_parameters,
				size: [widthPx, heightPx], 
				scale: scale, angle: angle,
				angle_parametrisation: angle_param,
				ornements: ornements,
				hatching: hatching,
				colormap: colormap,
				tile: tile,
				color_line: [color_line[0], color_line[1], color_line[2]] 
			})
		});
		const svg = await response.text();
		container.innerHTML = svg;
	} catch (error) {
		console.error("Request failed:", error);
	} finally {
		button.disabled = false;

	}
});
const params = document.querySelectorAll(".param");

function updateVisibility() {
	params.forEach(el => {
		let visible = true;
		if (this.checked){
		}

		for (const attr of el.attributes) {
			if (!attr.name.startsWith("data-show-")) continue;

			const selectId = attr.name.replace("data-show-", "");
			const select = document.getElementById(selectId);

			if (!select) continue;

			const allowedValues = attr.value.split(",");
			if (!allowedValues.includes(select.value)) {
				visible = false;
				break;
			}
		}

		el.classList.toggle("hidden", !visible);
	});
}
document.querySelectorAll("select").forEach(select => {
	select.addEventListener("change", updateVisibility);
});

document.querySelectorAll("checkbox").forEach(select => {
	select.addEventListener("change", updateVisibility);
});
// initial state
updateVisibility();


// print_modal.js
// ── Depends on getRGB() and choose_tess_id() already defined in mortier_app.js ──
// Include this file after mortier_app.js in your Hugo layout.

const PRINT_API = "https://mortier-api.onrender.com"; // ← replace with your Render URL
//const PRINT_API = "http://127.0.0.1:8000"; // ← replace with your Render URL

// ─── Collect all tiling parameters from the sidebar DOM ──────────────────────
// If mortier_app.js is ever refactored, replace this with the shared function.

function collectPrintParams() {
	const tessType = document.getElementById("tess-type").value;
	const scale    = parseFloat(document.getElementById("scale").value);
	const angle    = parseFloat(document.getElementById("angle").value);
	const colorRGB = getRGB(document.getElementById("line-color").value) ?? [0, 0, 0];
	const colormap = document.getElementById("color-map").value;
	const angleParam = document.getElementById("parametrisation").value;

	const ornementsType = document.getElementById("ornements").value;
	const ornements = ornementsType === "none"
		? { type: "none" }
		: { type: ornementsType, width: parseFloat(document.getElementById("bands-width").value) };

	const hatchType = document.getElementById("hatch-type").value;
	const hatching = hatchType === "none"
		? { type: "none" }
		: {
			type:       hatchType,
			spacing:    parseInt(document.getElementById("hatch-spacing").value),
			angle:      parseFloat(document.getElementById("hatch-angle").value),
			crosshatch: document.getElementById("crosshatch").checked,
		};

	let tess_parameters, tile = null;

	if (tessType === "regular") {
		let id = document.getElementById("tess-id").value;
		if (id === "random") id = choose_tess_id(); // defined in mortier_app.js
		tess_parameters = { type: "regular", id };

	} else if (tessType === "penrose") {
		tile = document.getElementById("tile-id").value;
		tess_parameters = { type: "penrose", depth: parseInt(document.getElementById("depth").value) };

	} else if (tessType === "hyperbolic") {
		tess_parameters = {
			type:        "hyperbolic",
			p:           parseInt(document.getElementById("p").value),
			q:           parseInt(document.getElementById("q").value),
			depth:       parseInt(document.getElementById("depth").value),
			refinements: parseInt(document.getElementById("refinements").value),
			half_plane:  document.getElementById("half-plane").checked,
		};
	}

	return {
		tess_parameters,
		scale,
		angle,
		angle_parametrisation: angleParam === "none" ? null : angleParam,
		ornements,
		hatching,
		colormap: colormap === "none" ? null : colormap,
		tile,
		color_line: colorRGB,
	};
}

// ─── Capture the current SVG from the page ───────────────────────────────────
// Coordinates of the poster area within your mockup PNG.
// Measure these from your actual mockup image (in pixels).
//
// ─── Inject modal styles once ─────────────────────────────────────────────────
function injectPrintStyles() {
	if (document.getElementById("print-modal-css")) return;
	const s = document.createElement("style");
	s.id = "print-modal-css";
	s.textContent = `
		#print-overlay {
			position: fixed; inset: 0; z-index: 9999;
			background: rgba(0,0,0,0.7);
			display: flex; align-items: flex-start; justify-content: flex-end;
		}
		#print-panel {
			width: 360px; height: 100vh; overflow-y: auto;
			background: #111; color: #fff;
			padding: 2rem 1.5rem; box-sizing: border-box;
			border-left: 1px solid rgba(255,255,255,0.1);
			animation: pm-slide 0.2s ease;
		}
		@keyframes pm-slide { from { transform: translateX(100%); } to { transform: translateX(0); } }
		#print-panel .pm-back {
			background: none; border: none; color: rgba(255,255,255,0.45);
			font-size: 13px; cursor: pointer; padding: 0; margin-bottom: 1.5rem;
		}
		#print-panel .pm-back:hover { color: #fff; }
		#print-panel h2 { font-size: 20px; font-weight: 500; margin: 0 0 4px; }
		#print-panel .pm-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0 0 1.75rem; }
		.pm-card {
			border: 1px solid rgba(255,255,255,0.1);
			border-radius: 8px; overflow: hidden; margin-bottom: 12px;
		}
		.pm-card.pm-featured { border-color: rgba(255,255,255,0.35); }
		.pm-preview {
			width: 100%; aspect-ratio: 3/4;
			position: relative; overflow: hidden; background: #0d0d0d;
		}
		.pm-frame {
			position: absolute; inset: 0;
			border: 14px solid #2a2218; box-sizing: border-box; pointer-events: none; z-index: 1;
		}
		.pm-frame-inner {
			position: absolute; inset: 14px;
			border: 2px solid #3d3024; box-sizing: border-box; pointer-events: none; z-index: 1;
		}
		.pm-canvas-edge {
			position: absolute; inset: 0; pointer-events: none; z-index: 1;
			box-shadow: inset 4px 4px 0 rgba(255,255,255,0.06), inset -4px -4px 0 rgba(0,0,0,0.4);
		}
		.pm-badge {
			position: absolute; top: 8px; left: 8px; z-index: 2;
			background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7);
			font-size: 11px; padding: 3px 8px; border-radius: 4px; pointer-events: none;
		}
		.pm-body {
			padding: 12px 14px;
			display: flex; align-items: center; gap: 10px;
		}
		.pm-info { flex: 1; min-width: 0; }
		.pm-name { font-size: 14px; font-weight: 500; margin: 0 0 2px; }
		.pm-desc { font-size: 12px; color: rgba(255,255,255,0.4); margin: 0; }
		.pm-price { font-size: 14px; font-weight: 500; white-space: nowrap; }
		.pm-btn {
			font-size: 12px; padding: 6px 14px; white-space: nowrap;
			border: 1px solid rgba(255,255,255,0.25); border-radius: 4px;
			background: none; color: #fff; cursor: pointer;
			transition: background 0.15s;
		}
		.pm-btn:hover    { background: rgba(255,255,255,0.08); }
		.pm-btn:disabled { opacity: 0.35; cursor: not-allowed; }
		.pm-note { font-size: 12px; color: rgba(255,255,255,0.25); text-align: center; margin-top: 1.5rem; }
		.pm-no-svg { font-size: 12px; color: rgba(255,255,255,0.2); padding: 1rem; text-align: center; }
	`;
	document.head.appendChild(s);
}

// ─── Render the mockup (generated tiling and base mockup) ─────────────────────────────────────────────────
function loadImage(src, cors = false) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		if (cors) img.crossOrigin = "anonymous";
		img.onload  = () => resolve(img);
		img.onerror = (e) => reject(new Error(`Failed to load image: ${src} — ${e.type}`));
		img.src = src;
	});
}

//TODO: Make sure that the generated image are 1 to 1 with what it sent to gelato
const PRINT_PRODUCTS = [
  {
    id:        "poster_a3",
    name:      "A3 poster",
    desc:      "297 × 420 mm · 170g/m · matte · shipping included",
    price:     "€25",
    popular:   true,
    mockupSrc: "/mortier/mockups/poster_a3.png",
    rect:      { x: 157, y: 64, w: 456, h: 612},  // ← adjust to your PNG
  },
  {
    id:        "poster_a4",
    name:      "A4 poster",
    desc:      "210 × 297 mm · 170g/m · matte · shipping included",
    price:     "€20",
    popular:   false,
    mockupSrc: "/mortier/mockups/poster_a4.png",
    rect:      { x: 173, y: 93, w: 331, h: 451}, // ← adjust to your PNG
  },
		{
    id:        "card_15x20",
    name:      "Card",
    desc:      "150 × 200 mm · 170g/m · matte · shipping included",
    price:     "€15",
    popular:   false,
    mockupSrc: "/mortier/mockups/card_15x20.jpg",
    rect:      { x: 79, y: 32, w: 856, h: 1217}, // ← adjust to your PNG
  },
];

async function buildMockupCanvas(mockupSrc, rect) {
  const container = document.getElementById("app");
  const svgEl = container.tagName === "SVG"
    ? container
    : container.querySelector("svg");

  if (!svgEl) throw new Error("No SVG found in #app — generate a tiling first");

  const clone = svgEl.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width",  rect.w);
  clone.setAttribute("height", rect.h);
  clone.setAttribute("preserveAspectRatio", "xMidYMid slice");
  clone.removeAttribute("style");

  clone.querySelectorAll("*").forEach(el => {
    if (!el.getAttribute("xmlns"))
      el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  });

  const svgUrl = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(clone)],
    { type: "image/svg+xml;charset=utf-8" })
  );

  try {
    const [mockupImg, tilingImg] = await Promise.all([
      loadImage(mockupSrc, true),
      loadImage(svgUrl,    false),
    ]);

    const canvas = document.createElement("canvas");
    canvas.width  = mockupImg.naturalWidth;
    canvas.height = mockupImg.naturalHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(mockupImg, 0, 0);
    ctx.drawImage(tilingImg, rect.x, rect.y, rect.w, rect.h);

    return canvas;
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

// ─── Build and open the modal ─────────────────────────────────────────────────

async function openPrintModal() {
	if (document.getElementById("print-overlay")) return;
	injectPrintStyles();

	const overlay = document.createElement("div");
	overlay.id = "print-overlay";
	overlay.addEventListener("click", e => { if (e.target === overlay) closePrintModal(); });

	const panel = document.createElement("div");
	panel.id = "print-panel";
	panel.innerHTML = `
		<button class="pm-back">← back to editor</button>
		<h2>Print your tiling</h2>
		<p class="pm-sub">Various formats · shipped within 3–5 business days</p>
		${PRINT_PRODUCTS.map(p => `
			<div class="pm-card ${p.popular ? "pm-featured" : ""}">
				<div class="pm-preview" id="pm-preview-${p.id}">
					${p.decoration === "frame"  ? '<div class="pm-frame"></div><div class="pm-frame-inner"></div>' : ""}
					${p.decoration === "canvas" ? '<div class="pm-canvas-edge"></div>' : ""}
					${p.popular                 ? '<div class="pm-badge">popular</div>' : ""}
				</div>
				<div class="pm-body">
					<div class="pm-info">
						<p class="pm-name">${p.name}</p>
						<p class="pm-desc">${p.desc}</p>
					</div>
					<span class="pm-price">${p.price}</span>
					<button class="pm-btn" data-product="${p.id}">Order</button>
				</div>
			</div>
		`).join("")}
		<p class="pm-note">Fulfilled by Gelato · free returns</p>
	`;

	overlay.appendChild(panel);
	document.body.appendChild(overlay);

	for (const p of PRINT_PRODUCTS) {
  const preview = document.getElementById(`pm-preview-${p.id}`);
  if (!preview) continue;

  try {
    const canvas = await buildMockupCanvas(p.mockupSrc, p.rect);
    if (canvas) {
      canvas.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
      preview.insertBefore(canvas, preview.firstChild);
    }
  } catch (err) {
    console.error(`Mockup failed for ${p.id}:`, err.message);
    const svgEl = document.getElementById("app")?.querySelector("svg");
    if (svgEl) preview.insertBefore(svgEl.cloneNode(true), preview.firstChild);
  }
}
  const svgEl = document.getElementById("app")?.querySelector("svg");
	panel.querySelector(".pm-back").addEventListener("click", closePrintModal);
	panel.querySelectorAll(".pm-btn").forEach(btn =>
		btn.addEventListener("click", () => handleOrder(btn.dataset.product, svgEl))
	);
}

function closePrintModal() {
	document.getElementById("print-overlay")?.remove();
}

// ─── Call backend and redirect to Stripe ──────────────────────────────────────

async function handleOrder(productId, svgEl) {
	const allBtns = document.querySelectorAll(".pm-btn");
	const activeBtn = document.querySelector(`.pm-btn[data-product="${productId}"]`);

	allBtns.forEach(b => { b.disabled = true; });
	activeBtn.textContent = "Preparing…";
	
	var s = new XMLSerializer();
	var svgStr = s.serializeToString(svgEl);

	try {
		//TODO: Check if image is 1 to 1 with sidebar !
		const res = await fetch(`${PRINT_API}/api/print`, {
			method:  "POST",
			headers: { "Content-Type": "application/json" },
			body:    JSON.stringify({ product_id: productId, svg:svgStr}),
		});

		if (!res.ok) throw new Error(`Server error ${res.status}`);

		const { checkout_url } = await res.json();
		window.location.href = checkout_url;

	} catch (err) {
		console.error("Print order failed:", err);
		activeBtn.textContent = "Error — try again";
		allBtns.forEach(b => { b.disabled = false; });
	}
}

// ─── Wire up ──────────────────────────────────────────────────────────────────

document.getElementById("print").addEventListener("click", openPrintModal);
