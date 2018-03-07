const colRecord = [];
const rowRecord = [];
const regionRecord = {};

let co = {
	col: [],
	row: []
};
/**
 * 流程模拟
 */

/**
 * 初始化
 */
colRecord.push('A','D');
rowRecord.push('1','6');
co.col.push('A','D');
co.row.push('1','6');
/**
 * 右滚动
 * （1）col极限值与像素值对比
 * 		不满足，加载
 * 			从co中获取row，转换为像素值，添加所需像素值
 * 				获取请求数据
 */
colRecord('H');
co.col.push('H');
/**
 * 继续右滚动
 * 	（1）略
 * 	（2）对于已加载区域释放
 * 		  对比左侧极限与co.col 左侧极限
 * 		  	对与需要释放的进行释放
 */
co.col.shift();

/**
 * 继续右滚动
 * 	 (1)略
 */

/**
 * 向下
 * 	（1)略
 */

/**
 * 向左
 */