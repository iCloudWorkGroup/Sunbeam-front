<template>
	<div class="fui-body">
		<div class="fui-layout">
			<div class="fui-transverse">
				<span class="section" data-widget="fontfamily" @click="activeWidget">
					<span class="fui-transverse-model fui-cf-fontfamily">{{currentState.content.family}}</span>
					<span class="fui-transverse-model fui-cf-fontfamily-extend active">
						<span class="caret"></span>
					</span>
				</span>
				<span class="section"  data-widget="fontsize" @click="activeWidget">
					<span class="fui-transverse-model fui-cf-fontsize">{{currentState.content.size}}</span>
					<span class="fui-transverse-model fui-cf-fontsize-extend active">
						<span class="caret"></span>
					</span>
				</span>
			</div>
			<div class="fui-transverse">
				<span class="ico-section" 
					data-type="content.weight" 
					title="加粗" 
					:class="{active: currentState.content.weight}"
					@click="reverseAction">
					<span class="fui-cf-ico ico-weight"></span>
				</span>
				<span class="ico-section" 
					data-type="content.italic" 
					title="斜体" 
					:class="{active: currentState.content.italic}"
					@click="reverseAction">
					<span class="fui-cf-ico ico-italic"></span>
				</span>
				<span class="ico-section" 
					data-type="content.underline" 
					title="下划线" 
					:class="{active: currentState.content.underline}"
					@click="reverseAction">
					<span class="fui-cf-ico ico-underline"></span>
				</span>
				<span class="ico-section" 
					data-widget="border" 
					title="边框" 
					@click="activeWidget">
					<span class="fui-cf-ico ico-borderbottom ico-section-ico"></span>
					<span class="ico-section-rightarrow">
						<span class="caret"></span>
					</span>
				</span>
				<span class="ico-section" data-widget="background" title="背景色" @click="activeWidget">
					<span class="fui-cf-ico ico-fillbg ico-section-ico"></span>
					<span class="ico-section-rightarrow">
						<span class="caret"></span>
					</span>
				</span>
				<span class="ico-section" data-widget="color" title="字体颜色" @click="activeWidget">
					<span class="fui-cf-ico ico-fillcolor ico-section-ico"></span>
					<span class="ico-section-rightarrow">
						<span class="caret"></span>
					</span>
				</span>
			</div>	
		</div>
		<div class="widget" ref="fontsize" 
			v-show="activeWidgetId === 'fontsize'"
			data-type="content.size"
			@mousedown.stop="setAction">
			<div class="widget-panel" style="max-height:200px;">
				<ul class="font-list" id="fontSize">
					<li data-value="8"><span style="font-size:8pt">8</span></li>
					<li data-value="9"><span style="font-size:9pt">9</span></li>
					<li data-value="10"><span style="font-size:10pt">10</span></li>
					<li data-value="11"><span style="font-size:11pt">11</span></li>
					<li data-value="12"><span style="font-size:12pt">12</span></li>
					<li data-value="14"><span style="font-size:14pt">14</span></li>
					<li data-value="16"><span style="font-size:16pt">16</span></li>
					<li data-value="18"><span style="font-size:18pt">18</span></li>
					<li data-value="20"><span style="font-size:20pt">20</span></li>
					<li data-value="24"><span style="font-size:24pt">24</span></li>
					<li data-value="26"><span style="font-size:26pt">26</span></li>
					<li data-value="28"><span style="font-size:28pt">28</span></li>
					<li data-value="36"><span style="font-size:36pt">36</span></li>
				</ul>
			</div>
		</div>
		<div class="widget" ref="fontfamily" 
			v-show="activeWidgetId === 'fontfamily'"
			data-type="content.family"
			@mousedown.stop="setAction">
			<div class="widget-panel" style="max-height:200px">
				<ul class="font-list" style="min-width:160px">
					<li data-value="microsoft Yahei"><span style="font-family:microsoft Yahei">微软雅黑</span></li>
					<li data-value="SimSun"><span style="font-family:SimSun">宋体</span></li>
					<li data-value="SimHei"><span style="font-family:SimHei">黑体</span></li>
					<li data-value="Tahoma"><span style="font-family:Tahoma">Tahoma</span></li>
					<li data-value="Arial"><span style="font-family:Arial">Arial</span></li>
					<li data-value="KaiTi"><span style="font-family:KaiTi">楷体</span></li>
				</ul>
			</div>
		</div>
		<div class="widget" ref="background" 
			v-show="activeWidgetId === 'background'"
			data-type="content.background"
			@mousedown.stop="setAction">
			<div class="widget-panel">
				<div style="padding:3px;cursor:default;font-size:9pt">
					<div style="padding:2px;height:15px">
						<div style="float:left;">
							<a title="白色" class="color-box">
								<div class="color-body" data-value="" style="background-color: rgb(0, 0, 0);"></div>
							</a>
						</div>
						<div style="margin-left:20px;">自动</div>
					</div>
					<div style="padding:2px 0;background:#fff;border-top:1px solid #e1e1e1;border-bottom:1px solid #e1e1e1">
						<table class="" cellspacing="0" cellpadding="0">
							<tbody>
								<tr>
									<td arrayposition="0">
										<a title="白色" class="color-box">
											<div class="color-body" data-value="rgb(255, 255, 255)" style="background-color: rgb(255, 255, 255);"></div>
										</a>
									</td>
									<td arrayposition="1">
										<a title="黑色" class="color-box">
											<div class="color-body" data-value="rgb(0, 0, 0)" style="background-color: rgb(0, 0, 0);"></div>
										</a>
									</td>
									<td arrayposition="2">
										<a title="茶色" class="color-box">
											<div class="color-body" data-value="rgb(238, 236, 225)" style="background-color: rgb(238, 236, 225);"></div>
										</a>
									</td>
									<td arrayposition="3">
										<a title="深蓝色" class="color-box">
											<div class="color-body" data-value="rgb(31, 73, 125)" style="background-color: rgb(31, 73, 125);"></div>
										</a>
									</td>
									<td arrayposition="4">
										<a title="蓝色" class="color-box">
											<div class="color-body" data-value="rgb(79, 129, 189)" style="background-color: rgb(79, 129, 189);"></div>
										</a>
									</td>
									<td arrayposition="5">
										<a title="红色" class="color-box">
											<div class="color-body" data-value="rgb(192, 80, 77)" style="background-color: rgb(192, 80, 77);"></div>
										</a>
									</td>
									<td arrayposition="6">
										<a title="橄榄色" class="color-box">
											<div class="color-body" data-value="rgb(155, 187, 89)" style="background-color: rgb(155, 187, 89);"></div>
										</a>
									</td>
									<td arrayposition="7">
										<a title="紫色" class="color-box">
											<div class="color-body" data-value="rgb(128, 100, 162)" style="background-color: rgb(128, 100, 162);"></div>
										</a>
									</td>
									<td arrayposition="8">
										<a title="水绿色" class="color-box">
											<div class="color-body" data-value="rgb(75, 172, 198)" style="background-color: rgb(75, 172, 198);"></div>
										</a>
									</td>
									<td arrayposition="9">
										<a title="橙色" class="color-box">
											<div class="color-body" data-value="rgb(247, 150, 70)" style="background-color: rgb(247, 150, 70);"></div>
										</a>
									</td>
								</tr>
								<tr>
									<td arrayposition="10">
										<a title="深白色 5%" class="color-box">
											<div class="color-body" data-value="rgb(242, 242, 242)" style="background-color: rgb(242, 242, 242);"></div>
										</a>
									</td>
									<td arrayposition="11">
										<a title="浅黑色 50%" class="color-box">
											<div class="color-body" data-value="rgb(127, 127, 127)" style="background-color: rgb(127, 127, 127);"></div>
										</a>
									</td>
									<td arrayposition="12">
										<a title="深茶色 10%" class="color-box">
											<div class="color-body" data-value="rgb(221, 217, 195)" style="background-color: rgb(221, 217, 195);">
												
											</div>
										</a>
									</td>
									<td arrayposition="13">
										<a title="较浅的深蓝色 80%" class="color-box">
											<div class="color-body" data-value="rgb(198, 217, 240)" style="background-color: rgb(198, 217, 240);"></div>
										</a>
									</td>
									<td arrayposition="14">
										<a title="浅蓝色 80%" class="color-box">
											<div class="color-body" data-value="rgb(219, 229, 241)" style="background-color: rgb(219, 229, 241);"></div>
										</a>
									</td>
									<td arrayposition="15">
										<a title="浅红色 80%" class="color-box">
											<div class="color-body" data-value="rgb(242, 220, 219)" style="background-color: rgb(242, 220, 219);"></div>
										</a>
									</td>
									<td arrayposition="16">
										<a title="较浅的橄榄色 80%" class="color-box">
											<div class="color-body" data-value="rgb(235, 241, 221)" style="background-color: rgb(235, 241, 221);"></div>
										</a>
									</td>
									<td arrayposition="17">
										<a title="浅紫色 80%" class="color-box">
											<div class="color-body" data-value="rgb(229, 224, 236)" style="background-color: rgb(229, 224, 236);"></div>
										</a>
									</td>
									<td arrayposition="18">
										<a title="浅绿色 80%" class="color-box">
											<div class="color-body" data-value="rgb(219, 238, 243)" style="background-color: rgb(219, 238, 243);">
												
											</div>
										</a>
									</td>
									<td arrayposition="19">
										<a title="浅橙色 80%" class="color-box">
											<div class="color-body" data-value="rgb(253, 234, 218)" style="background-color: rgb(253, 234, 218);">
												
											</div>
										</a>
									</td>
								</tr>
								<tr>
									<td arrayposition="20">
										<a title="深白色 15%" class="color-box">
											<div class="color-body" data-value="rgb(216, 216, 216)" style="background-color: rgb(216, 216, 216);">
												
											</div>
										</a>
									</td>
									<td arrayposition="21">
										<a title="浅黑色 35%" class="color-box">
											<div class="color-body" data-value="rgb(89, 89, 89)" style="background-color: rgb(89, 89, 89);">
												
											</div>
										</a>
									</td>
									<td arrayposition="22">
										<a title="深茶色 25%" class="color-box">
											<div class="color-body" data-value="rgb(196, 189, 151)" style="background-color: rgb(196, 189, 151);">
												
											</div>
										</a>
									</td>
									<td arrayposition="23">
										<a title="较浅的深蓝色 60%" class="color-box">
											<div class="color-body" data-value="rgb(141, 179, 226)" style="background-color: rgb(141, 179, 226);">
												
											</div>
										</a>
									</td>
									<td arrayposition="24">
										<a title="浅蓝色 60%" class="color-box">
											<div class="color-body" data-value="rgb(184, 204, 228)" style="background-color: rgb(184, 204, 228);">
												
											</div>
										</a>
									</td>
									<td arrayposition="25">
										<a title="浅红色 60%" class="color-box">
											<div class="color-body" data-value="rgb(229, 185, 183)" style="background-color: rgb(229, 185, 183);">
												
											</div>
										</a>
									</td>
									<td arrayposition="26">
										<a title="较浅的橄榄色 60%" class="color-box">
											<div class="color-body" data-value="rgb(215, 227, 188)" style="background-color: rgb(215, 227, 188);">
												
											</div>
										</a>
									</td>
									<td arrayposition="27">
										<a title="浅紫色 60%" class="color-box">
											<div class="color-body" data-value="rgb(204, 193, 217)" style="background-color: rgb(204, 193, 217);">
												
											</div>
										</a>
									</td>
									<td arrayposition="28">
										<a title="浅绿色 80%" class="color-box">
											<div class="color-body" data-value="rgb(183, 221, 232)" style="background-color: rgb(183, 221, 232);">
												
											</div>
										</a>
									</td>
									<td arrayposition="29">
										<a title="浅橙色 60%" class="color-box">
											<div class="color-body" data-value="rgb(251, 213, 181)" style="background-color: rgb(251, 213, 181);">
												
											</div>
										</a>
									</td>
								</tr>
								<tr>
									<td arrayposition="30">
										<a title="深白色 25%" class="color-box">
											<div class="color-body" data-value="rgb(191, 191, 191)" style="background-color: rgb(191, 191, 191);">
												
											</div>
										</a>
									</td>
									<td arrayposition="31">
										<a title="浅黑色 25%" class="color-box">
											<div class="color-body" data-value="rgb(63, 63, 63)" style="background-color: rgb(63, 63, 63);">
												
											</div>
										</a>
									</td>
									<td arrayposition="32">
										<a title="深茶色 50%" class="color-box">
											<div class="color-body" data-value="rgb(147, 137, 83)" style="background-color: rgb(147, 137, 83);">
												
											</div>
										</a>
									</td>
									<td arrayposition="33">
										<a title="较浅的深蓝色 40%" class="color-box">
											<div class="color-body" data-value="rgb(84, 141, 212)" style="background-color: rgb(84, 141, 212);">
												
											</div>
										</a>
									</td>
									<td arrayposition="34">
										<a title="浅蓝色 40%" class="color-box">
											<div class="color-body" data-value="rgb(149, 179, 215)" style="background-color: rgb(149, 179, 215);">
												
											</div>
										</a>
									</td>
									<td arrayposition="35">
										<a title="浅红色 40%" class="color-box">
											<div class="color-body" data-value="rgb(217, 150, 148)" style="background-color: rgb(217, 150, 148);">
												
											</div>
										</a>
									</td>
									<td arrayposition="36">
										<a title="较浅的橄榄色 40%" class="color-box">
											<div class="color-body" data-value="rgb(195, 214, 155)" style="background-color: rgb(195, 214, 155);">
												
											</div>
										</a>
									</td>
									<td arrayposition="37">
										<a title="浅紫色 40%" class="color-box">
											<div class="color-body" data-value="rgb(178, 162, 199)" style="background-color: rgb(178, 162, 199);">
												
											</div>
										</a>
									</td>
									<td arrayposition="38">
										<a title="浅绿色 40%" class="color-box">
											<div class="color-body" data-value="rgb(146, 205, 220)" style="background-color: rgb(146, 205, 220);">
												
											</div>
										</a>
									</td>
									<td arrayposition="39">
										<a title="浅橙色 40%" class="color-box">
											<div class="color-body" data-value="rgb(250, 192, 143)" style="background-color: rgb(250, 192, 143);">
												
											</div>
										</a>
									</td>
								</tr>
								<tr>
									<td arrayposition="40">
										<a title="深白色 5%" class="color-box">
											<div class="color-body" data-value="rgb(165, 165, 165)" style="background-color: rgb(165, 165, 165);">
												
											</div>
										</a>
									</td>
									<td arrayposition="41">
										<a title="浅黑色 15%" class="color-box">
											<div class="color-body" data-value="rgb(38, 38, 38)" style="background-color: rgb(38, 38, 38);">
												
											</div>
										</a>
									</td>
									<td arrayposition="42">
										<a title="深茶色 75%" class="color-box">
											<div class="color-body" data-value="rgb(73, 68, 41)" style="background-color: rgb(73, 68, 41);">
												
											</div>
										</a>
									</td>
									<td arrayposition="43">
										<a title="较浅的深蓝色 25%" class="color-box">
											<div class="color-body" data-value="rgb(23, 54, 93)" style="background-color: rgb(23, 54, 93);">
												
											</div>
										</a>
									</td>
									<td arrayposition="44">
										<a title="深黑色 25%" class="color-box">
											<div class="color-body" data-value="rgb(54, 96, 146)" style="background-color: rgb(54, 96, 146);">
												
											</div>
										</a>
									</td>
									<td arrayposition="45">
										<a title="深红色 25%" class="color-box">
											<div class="color-body" data-value="rgb(149, 55, 52)" style="background-color: rgb(149, 55, 52);">
												
											</div>
										</a>
									</td>
									<td arrayposition="46">
										<a title="较深的橄榄色 25%" class="color-box">
											<div class="color-body" data-value="rgb(118, 146, 60)" style="background-color: rgb(118, 146, 60);">
												
											</div>
										</a>
									</td>
									<td arrayposition="47">
										<a title="深紫色 25%" class="color-box">
											<div class="color-body" data-value="rgb(95, 73, 122)" style="background-color: rgb(95, 73, 122);">
												
											</div>
										</a>
									</td>
									<td arrayposition="48">
										<a title="暗绿色 25%" class="color-box">
											<div class="color-body" data-value="rgb(49, 132, 155)" style="background-color: rgb(49, 132, 155);">
												
											</div>
										</a>
									</td>
									<td arrayposition="49">
										<a title="深橙色 25%" class="color-box">
											<div class="color-body" data-value="rgb(227, 108, 9)" style="background-color: rgb(227, 108, 9);">
												
											</div>
										</a>
									</td>
								</tr>
								<tr>
									<td arrayposition="50">
										<a title="深白色 50%" class="color-box">
											<div class="color-body" data-value="rgb(127, 127, 127)" style="background-color: rgb(127, 127, 127);">
												
											</div>
										</a>
									</td>
									<td arrayposition="51">
										<a title="浅黑色 5%" class="color-box">
											<div class="color-body" data-value="rgb(12, 12, 12)" style="background-color: rgb(12, 12, 12);">
												
											</div>
										</a>
									</td>
									<td arrayposition="52">
										<a title="深茶色 90%" class="color-box">
											<div class="color-body" data-value="rgb(29, 27, 16)" style="background-color: rgb(29, 27, 16);">
												
											</div>
										</a>
									</td>
									<td arrayposition="53">
										<a title="较浅的深蓝色 50%" class="color-box">
											<div class="color-body" data-value="rgb(15, 36, 62)" style="background-color: rgb(15, 36, 62);">
												
											</div>
										</a>
									</td>
									<td arrayposition="54">
										<a title="深黑色 50%" class="color-box">
											<div class="color-body" data-value="rgb(36, 64, 97)" style="background-color: rgb(36, 64, 97);">
												
											</div>
										</a>
									</td>
									<td arrayposition="55">
										<a title="深红色 50%" class="color-box">
											<div class="color-body" data-value="rgb(99, 36, 35)" style="background-color: rgb(99, 36, 35);">
												
											</div>
										</a>
									</td>
									<td arrayposition="56">
										<a title="较深的橄榄色 50%" class="color-box">
											<div class="color-body" data-value="rgb(79, 97, 40)" style="background-color: rgb(79, 97, 40);">
												
											</div>
										</a>
									</td>
									<td arrayposition="57">
										<a title="深紫色 50%" class="color-box">
											<div class="color-body" data-value="rgb(63, 49, 81)" style="background-color: rgb(63, 49, 81);">
												
											</div>
										</a>
									</td>
									<td arrayposition="58">
										<a title="暗绿色 50%" class="color-box">
											<div class="color-body" data-value="rgb(32, 88, 103)" style="background-color: rgb(32, 88, 103);">
												
											</div>
										</a>
									</td>
									<td arrayposition="59">
										<a title="深橙色 50%" class="color-box">
											<div class="color-body" data-value="rgb(152, 72, 6)" style="background-color: rgb(152, 72, 6);">
												
											</div>
										</a>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div>
						<div style="padding:6px;background:#e1e1e1;">标准颜色</div>
						<div style="padding-top:2px">
							<table cellspacing="0" cellpadding="0">
								<tbody>
									<tr>
										<td arrayposition="0">
											<a title="深红色" class="color-box">
												<div class="color-body" data-value="rgb(192, 0, 0)" style="background-color: rgb(192, 0, 0);">
													
												</div>
											</a>
										</td>
										<td arrayposition="1">
											<a title="红色" class="color-box">
												<div class="color-body" data-value="rgb(255, 0, 0)" style="background-color: rgb(255, 0, 0);">
													
												</div>
											</a>
										</td>
										<td arrayposition="2">
											<a title="橙色" class="color-box">
												<div class="color-body" data-value="rgb(255, 192, 0)" style="background-color: rgb(255, 192, 0);">
													
												</div>
											</a>
										</td>
										<td arrayposition="3">
											<a title="黄色" class="color-box">
												<div class="color-body" data-value="rgb(255, 255, 0)" style="background-color: rgb(255, 255, 0);">
													
												</div>
											</a>
										</td>
										<td arrayposition="4">
											<a title="浅绿色" class="color-box">
												<div class="color-body" data-value="rgb(146, 208, 80)" style="background-color: rgb(146, 208, 80);">
													
												</div>
											</a>
										</td>
										<td arrayposition="5">
											<a title="深绿色" class="color-box">
												<div class="color-body" data-value="rgb(0, 176, 80)" style="background-color: rgb(0, 176, 80);">
													
												</div>
											</a>
										</td>
										<td arrayposition="6">
											<a title="浅蓝色" class="color-box">
												<div class="color-body" data-value="rgb(0, 176, 240)" style="background-color: rgb(0, 176, 240);">
													
												</div>
											</a>
										</td>
										<td arrayposition="7">
											<a title="蓝色" class="color-box">
												<div class="color-body" data-value="rgb(0, 112, 192)" style="background-color: rgb(0, 112, 192);">
													
												</div>
											</a>
										</td>
										<td arrayposition="8">
											<a title="深蓝色" class="color-box">
												<div class="color-body" data-value="rgb(0, 32, 96)" style="background-color: rgb(0, 32, 96);">
													
												</div>
											</a>
										</td>
										<td arrayposition="9">
											<a title="紫色" class="color-box">
												<div class="color-body" data-value="rgb(112, 48, 160)" style="background-color: rgb(112, 48, 160);">
													
												</div>
											</a>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="widget" ref="color" 
			v-show="activeWidgetId === 'color'"
			data-type="content.color"
			@mousedown.stop="setAction">
				<div class="widget-panel">
					<div style="padding:3px;cursor:default;font-size:9pt">
						<div style="padding:2px;height:15px">
							<div style="float:left;">
								<a title="白色" class="color-box">
									<div class="color-body" data-value="" style="background-color: rgb(0, 0, 0);"></div>
								</a>
							</div>
							<div style="margin-left:20px;">自动</div>
						</div>
						<div style="padding:2px 0;background:#fff;border-top:1px solid #e1e1e1;border-bottom:1px solid #e1e1e1">
							<table class="" cellspacing="0" cellpadding="0">
								<tbody>
									<tr>
										<td arrayposition="0">
											<a title="白色" class="color-box">
												<div class="color-body" data-value="rgb(255, 255, 255)" style="background-color: rgb(255, 255, 255);"></div>
											</a>
										</td>
										<td arrayposition="1">
											<a title="黑色" class="color-box">
												<div class="color-body" data-value="rgb(0, 0, 0)" style="background-color: rgb(0, 0, 0);"></div>
											</a>
										</td>
										<td arrayposition="2">
											<a title="茶色" class="color-box">
												<div class="color-body" data-value="rgb(238, 236, 225)" style="background-color: rgb(238, 236, 225);"></div>
											</a>
										</td>
										<td arrayposition="3">
											<a title="深蓝色" class="color-box">
												<div class="color-body" data-value="rgb(31, 73, 125)" style="background-color: rgb(31, 73, 125);"></div>
											</a>
										</td>
										<td arrayposition="4">
											<a title="蓝色" class="color-box">
												<div class="color-body" data-value="rgb(79, 129, 189)" style="background-color: rgb(79, 129, 189);"></div>
											</a>
										</td>
										<td arrayposition="5">
											<a title="红色" class="color-box">
												<div class="color-body" data-value="rgb(192, 80, 77)" style="background-color: rgb(192, 80, 77);"></div>
											</a>
										</td>
										<td arrayposition="6">
											<a title="橄榄色" class="color-box">
												<div class="color-body" data-value="rgb(155, 187, 89)" style="background-color: rgb(155, 187, 89);"></div>
											</a>
										</td>
										<td arrayposition="7">
											<a title="紫色" class="color-box">
												<div class="color-body" data-value="rgb(128, 100, 162)" style="background-color: rgb(128, 100, 162);"></div>
											</a>
										</td>
										<td arrayposition="8">
											<a title="水绿色" class="color-box">
												<div class="color-body" data-value="rgb(75, 172, 198)" style="background-color: rgb(75, 172, 198);"></div>
											</a>
										</td>
										<td arrayposition="9">
											<a title="橙色" class="color-box">
												<div class="color-body" data-value="rgb(247, 150, 70)" style="background-color: rgb(247, 150, 70);"></div>
											</a>
										</td>
									</tr>
									<tr>
										<td arrayposition="10">
											<a title="深白色 5%" class="color-box">
												<div class="color-body" data-value="rgb(242, 242, 242)" style="background-color: rgb(242, 242, 242);"></div>
											</a>
										</td>
										<td arrayposition="11">
											<a title="浅黑色 50%" class="color-box">
												<div class="color-body" data-value="rgb(127, 127, 127)" style="background-color: rgb(127, 127, 127);"></div>
											</a>
										</td>
										<td arrayposition="12">
											<a title="深茶色 10%" class="color-box">
												<div class="color-body" data-value="rgb(221, 217, 195)" style="background-color: rgb(221, 217, 195);">
													
												</div>
											</a>
										</td>
										<td arrayposition="13">
											<a title="较浅的深蓝色 80%" class="color-box">
												<div class="color-body" data-value="rgb(198, 217, 240)" style="background-color: rgb(198, 217, 240);"></div>
											</a>
										</td>
										<td arrayposition="14">
											<a title="浅蓝色 80%" class="color-box">
												<div class="color-body" data-value="rgb(219, 229, 241)" style="background-color: rgb(219, 229, 241);"></div>
											</a>
										</td>
										<td arrayposition="15">
											<a title="浅红色 80%" class="color-box">
												<div class="color-body" data-value="rgb(242, 220, 219)" style="background-color: rgb(242, 220, 219);"></div>
											</a>
										</td>
										<td arrayposition="16">
											<a title="较浅的橄榄色 80%" class="color-box">
												<div class="color-body" data-value="rgb(235, 241, 221)" style="background-color: rgb(235, 241, 221);"></div>
											</a>
										</td>
										<td arrayposition="17">
											<a title="浅紫色 80%" class="color-box">
												<div class="color-body" data-value="rgb(229, 224, 236)" style="background-color: rgb(229, 224, 236);"></div>
											</a>
										</td>
										<td arrayposition="18">
											<a title="浅绿色 80%" class="color-box">
												<div class="color-body" data-value="rgb(219, 238, 243)" style="background-color: rgb(219, 238, 243);">
													
												</div>
											</a>
										</td>
										<td arrayposition="19">
											<a title="浅橙色 80%" class="color-box">
												<div class="color-body" data-value="rgb(253, 234, 218)" style="background-color: rgb(253, 234, 218);">
													
												</div>
											</a>
										</td>
									</tr>
									<tr>
										<td arrayposition="20">
											<a title="深白色 15%" class="color-box">
												<div class="color-body" data-value="rgb(216, 216, 216)" style="background-color: rgb(216, 216, 216);">
													
												</div>
											</a>
										</td>
										<td arrayposition="21">
											<a title="浅黑色 35%" class="color-box">
												<div class="color-body" data-value="rgb(89, 89, 89)" style="background-color: rgb(89, 89, 89);">
													
												</div>
											</a>
										</td>
										<td arrayposition="22">
											<a title="深茶色 25%" class="color-box">
												<div class="color-body" data-value="rgb(196, 189, 151)" style="background-color: rgb(196, 189, 151);">
													
												</div>
											</a>
										</td>
										<td arrayposition="23">
											<a title="较浅的深蓝色 60%" class="color-box">
												<div class="color-body" data-value="rgb(141, 179, 226)" style="background-color: rgb(141, 179, 226);">
													
												</div>
											</a>
										</td>
										<td arrayposition="24">
											<a title="浅蓝色 60%" class="color-box">
												<div class="color-body" data-value="rgb(184, 204, 228)" style="background-color: rgb(184, 204, 228);">
													
												</div>
											</a>
										</td>
										<td arrayposition="25">
											<a title="浅红色 60%" class="color-box">
												<div class="color-body" data-value="rgb(229, 185, 183)" style="background-color: rgb(229, 185, 183);">
													
												</div>
											</a>
										</td>
										<td arrayposition="26">
											<a title="较浅的橄榄色 60%" class="color-box">
												<div class="color-body" data-value="rgb(215, 227, 188)" style="background-color: rgb(215, 227, 188);">
													
												</div>
											</a>
										</td>
										<td arrayposition="27">
											<a title="浅紫色 60%" class="color-box">
												<div class="color-body" data-value="rgb(204, 193, 217)" style="background-color: rgb(204, 193, 217);">
													
												</div>
											</a>
										</td>
										<td arrayposition="28">
											<a title="浅绿色 80%" class="color-box">
												<div class="color-body" data-value="rgb(183, 221, 232)" style="background-color: rgb(183, 221, 232);">
													
												</div>
											</a>
										</td>
										<td arrayposition="29">
											<a title="浅橙色 60%" class="color-box">
												<div class="color-body" data-value="rgb(251, 213, 181)" style="background-color: rgb(251, 213, 181);">
													
												</div>
											</a>
										</td>
									</tr>
									<tr>
										<td arrayposition="30">
											<a title="深白色 25%" class="color-box">
												<div class="color-body" data-value="rgb(191, 191, 191)" style="background-color: rgb(191, 191, 191);">
													
												</div>
											</a>
										</td>
										<td arrayposition="31">
											<a title="浅黑色 25%" class="color-box">
												<div class="color-body" data-value="rgb(63, 63, 63)" style="background-color: rgb(63, 63, 63);">
													
												</div>
											</a>
										</td>
										<td arrayposition="32">
											<a title="深茶色 50%" class="color-box">
												<div class="color-body" data-value="rgb(147, 137, 83)" style="background-color: rgb(147, 137, 83);">
													
												</div>
											</a>
										</td>
										<td arrayposition="33">
											<a title="较浅的深蓝色 40%" class="color-box">
												<div class="color-body" data-value="rgb(84, 141, 212)" style="background-color: rgb(84, 141, 212);">
													
												</div>
											</a>
										</td>
										<td arrayposition="34">
											<a title="浅蓝色 40%" class="color-box">
												<div class="color-body" data-value="rgb(149, 179, 215)" style="background-color: rgb(149, 179, 215);">
													
												</div>
											</a>
										</td>
										<td arrayposition="35">
											<a title="浅红色 40%" class="color-box">
												<div class="color-body" data-value="rgb(217, 150, 148)" style="background-color: rgb(217, 150, 148);">
													
												</div>
											</a>
										</td>
										<td arrayposition="36">
											<a title="较浅的橄榄色 40%" class="color-box">
												<div class="color-body" data-value="rgb(195, 214, 155)" style="background-color: rgb(195, 214, 155);">
													
												</div>
											</a>
										</td>
										<td arrayposition="37">
											<a title="浅紫色 40%" class="color-box">
												<div class="color-body" data-value="rgb(178, 162, 199)" style="background-color: rgb(178, 162, 199);">
													
												</div>
											</a>
										</td>
										<td arrayposition="38">
											<a title="浅绿色 40%" class="color-box">
												<div class="color-body" data-value="rgb(146, 205, 220)" style="background-color: rgb(146, 205, 220);">
													
												</div>
											</a>
										</td>
										<td arrayposition="39">
											<a title="浅橙色 40%" class="color-box">
												<div class="color-body" data-value="rgb(250, 192, 143)" style="background-color: rgb(250, 192, 143);">
													
												</div>
											</a>
										</td>
									</tr>
									<tr>
										<td arrayposition="40">
											<a title="深白色 5%" class="color-box">
												<div class="color-body" data-value="rgb(165, 165, 165)" style="background-color: rgb(165, 165, 165);">
													
												</div>
											</a>
										</td>
										<td arrayposition="41">
											<a title="浅黑色 15%" class="color-box">
												<div class="color-body" data-value="rgb(38, 38, 38)" style="background-color: rgb(38, 38, 38);">
													
												</div>
											</a>
										</td>
										<td arrayposition="42">
											<a title="深茶色 75%" class="color-box">
												<div class="color-body" data-value="rgb(73, 68, 41)" style="background-color: rgb(73, 68, 41);">
													
												</div>
											</a>
										</td>
										<td arrayposition="43">
											<a title="较浅的深蓝色 25%" class="color-box">
												<div class="color-body" data-value="rgb(23, 54, 93)" style="background-color: rgb(23, 54, 93);">
													
												</div>
											</a>
										</td>
										<td arrayposition="44">
											<a title="深黑色 25%" class="color-box">
												<div class="color-body" data-value="rgb(54, 96, 146)" style="background-color: rgb(54, 96, 146);">
													
												</div>
											</a>
										</td>
										<td arrayposition="45">
											<a title="深红色 25%" class="color-box">
												<div class="color-body" data-value="rgb(149, 55, 52)" style="background-color: rgb(149, 55, 52);">
													
												</div>
											</a>
										</td>
										<td arrayposition="46">
											<a title="较深的橄榄色 25%" class="color-box">
												<div class="color-body" data-value="rgb(118, 146, 60)" style="background-color: rgb(118, 146, 60);">
													
												</div>
											</a>
										</td>
										<td arrayposition="47">
											<a title="深紫色 25%" class="color-box">
												<div class="color-body" data-value="rgb(95, 73, 122)" style="background-color: rgb(95, 73, 122);">
													
												</div>
											</a>
										</td>
										<td arrayposition="48">
											<a title="暗绿色 25%" class="color-box">
												<div class="color-body" data-value="rgb(49, 132, 155)" style="background-color: rgb(49, 132, 155);">
													
												</div>
											</a>
										</td>
										<td arrayposition="49">
											<a title="深橙色 25%" class="color-box">
												<div class="color-body" data-value="rgb(227, 108, 9)" style="background-color: rgb(227, 108, 9);">
													
												</div>
											</a>
										</td>
									</tr>
									<tr>
										<td arrayposition="50">
											<a title="深白色 50%" class="color-box">
												<div class="color-body" data-value="rgb(127, 127, 127)" style="background-color: rgb(127, 127, 127);">
													
												</div>
											</a>
										</td>
										<td arrayposition="51">
											<a title="浅黑色 5%" class="color-box">
												<div class="color-body" data-value="rgb(12, 12, 12)" style="background-color: rgb(12, 12, 12);">
													
												</div>
											</a>
										</td>
										<td arrayposition="52">
											<a title="深茶色 90%" class="color-box">
												<div class="color-body" data-value="rgb(29, 27, 16)" style="background-color: rgb(29, 27, 16);">
													
												</div>
											</a>
										</td>
										<td arrayposition="53">
											<a title="较浅的深蓝色 50%" class="color-box">
												<div class="color-body" data-value="rgb(15, 36, 62)" style="background-color: rgb(15, 36, 62);">
													
												</div>
											</a>
										</td>
										<td arrayposition="54">
											<a title="深黑色 50%" class="color-box">
												<div class="color-body" data-value="rgb(36, 64, 97)" style="background-color: rgb(36, 64, 97);">
													
												</div>
											</a>
										</td>
										<td arrayposition="55">
											<a title="深红色 50%" class="color-box">
												<div class="color-body" data-value="rgb(99, 36, 35)" style="background-color: rgb(99, 36, 35);">
													
												</div>
											</a>
										</td>
										<td arrayposition="56">
											<a title="较深的橄榄色 50%" class="color-box">
												<div class="color-body" data-value="rgb(79, 97, 40)" style="background-color: rgb(79, 97, 40);">
													
												</div>
											</a>
										</td>
										<td arrayposition="57">
											<a title="深紫色 50%" class="color-box">
												<div class="color-body" data-value="rgb(63, 49, 81)" style="background-color: rgb(63, 49, 81);">
													
												</div>
											</a>
										</td>
										<td arrayposition="58">
											<a title="暗绿色 50%" class="color-box">
												<div class="color-body" data-value="rgb(32, 88, 103)" style="background-color: rgb(32, 88, 103);">
													
												</div>
											</a>
										</td>
										<td arrayposition="59">
											<a title="深橙色 50%" class="color-box">
												<div class="color-body" data-value="rgb(152, 72, 6)" style="background-color: rgb(152, 72, 6);">
													
												</div>
											</a>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
						<div>
							<div style="padding:6px;background:#e1e1e1;">标准颜色</div>
							<div style="padding-top:2px">
								<table cellspacing="0" cellpadding="0">
									<tbody>
										<tr>
											<td arrayposition="0">
												<a title="深红色" class="color-box">
													<div class="color-body" data-value="rgb(192, 0, 0)" style="background-color: rgb(192, 0, 0);">
														
													</div>
												</a>
											</td>
											<td arrayposition="1">
												<a title="红色" class="color-box">
													<div class="color-body" data-value="rgb(255, 0, 0)" style="background-color: rgb(255, 0, 0);">
														
													</div>
												</a>
											</td>
											<td arrayposition="2">
												<a title="橙色" class="color-box">
													<div class="color-body" data-value="rgb(255, 192, 0)" style="background-color: rgb(255, 192, 0);">
														
													</div>
												</a>
											</td>
											<td arrayposition="3">
												<a title="黄色" class="color-box">
													<div class="color-body" data-value="rgb(255, 255, 0)" style="background-color: rgb(255, 255, 0);">
														
													</div>
												</a>
											</td>
											<td arrayposition="4">
												<a title="浅绿色" class="color-box">
													<div class="color-body" data-value="rgb(146, 208, 80)" style="background-color: rgb(146, 208, 80);">
														
													</div>
												</a>
											</td>
											<td arrayposition="5">
												<a title="深绿色" class="color-box">
													<div class="color-body" data-value="rgb(0, 176, 80)" style="background-color: rgb(0, 176, 80);">
														
													</div>
												</a>
											</td>
											<td arrayposition="6">
												<a title="浅蓝色" class="color-box">
													<div class="color-body" data-value="rgb(0, 176, 240)" style="background-color: rgb(0, 176, 240);">
														
													</div>
												</a>
											</td>
											<td arrayposition="7">
												<a title="蓝色" class="color-box">
													<div class="color-body" data-value="rgb(0, 112, 192)" style="background-color: rgb(0, 112, 192);">
														
													</div>
												</a>
											</td>
											<td arrayposition="8">
												<a title="深蓝色" class="color-box">
													<div class="color-body" data-value="rgb(0, 32, 96)" style="background-color: rgb(0, 32, 96);">
														
													</div>
												</a>
											</td>
											<td arrayposition="9">
												<a title="紫色" class="color-box">
													<div class="color-body" data-value="rgb(112, 48, 160)" style="background-color: rgb(112, 48, 160);">
														
													</div>
												</a>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
		</div>
		<div class="widget" ref="border" 
			v-show="activeWidgetId === 'border'"
			@mousedown.stop="setBorder">
				<div class="widget-panel">
					<ul class="widget-menu" id="funcBorder">
						<li data-value="bottom">
							<span class="fui-cf-ico ico-borderbottom ico-section-ico widget-ico"></span>
							<span class="widget-content">
								<div>下边框</div>
							</span>
						</li>
						<li data-value="top">
							<span class="fui-cf-ico ico-bordertop ico-section-ico widget-ico"></span>
							<span class="widget-content">
								<div>上边框</div>
							</span>
						</li>
						<li data-value="left">
							<span class="fui-cf-ico ico-borderleft ico-section-ico widget-ico"></span>
							<span class="widget-content">
								<div>左边框</div>
							</span>
						</li>
						<li data-value="right">
							<span class="fui-cf-ico ico-borderright ico-section-ico widget-ico"></span>
							<span class="widget-content">
								<div>右边框</div>
							</span>
						</li>
						<li data-value="none">
							<span class="fui-cf-ico ico-bordernone ico-section-ico widget-ico"></span>
							<span class="widget-content">
								<div>无边框</div>
							</span>
						</li>
						<li data-value="all">
							<span class="fui-cf-ico ico-borderall ico-section-ico widget-ico"></span>
							<span class="widget-content">
								<div>所有边框</div>
							</span>
						</li>
						<li data-value="outer">
							<span class="fui-cf-ico ico-borderouter ico-section-ico widget-ico"></span>
							<span class="widget-content">
								<div>外侧边框</div>
							</span>
						</li>
					</ul>
				</div>
		</div>	
	</div>
</template>
<script type="text/javascript">
	import {CELLS_UPDATE, CELLS_UPDATE_BORDER} from '../../store/action-types';

	export default {
		props: [
			'activeWidgetId'
		],
		computed: {
			currentState(){
				let cellProps = this.$store.getters.getSelectCell,
					family = cellProps.content.family;
				const font2zh = {
					'SimSun': '宋体',
					'SimHei': '黑体',
					'KaiTi': '楷体'
				};
				let temp;
				if((temp = font2zh[family])){
					cellProps.content.family = temp;
				}
				return cellProps;
			}
		},
		methods: {
			activeWidget(e){
				let elem = e.currentTarget,
					widgetId = elem.dataset.widget,
					widget,
					box;

				if (!widgetId) {
					return;
				}
				
				box = elem.getBoundingClientRect();
				widget = this.$refs[widgetId];
				widget.style.top = box.top + box.height + 'px';
				widget.style.left = box.left + 'px';

				this.$emit('updateActiveWidgetId', widgetId);
			},
			setAction(e) {
				e.stopPropagation();
				let currentTarget = e.currentTarget,
					type = currentTarget.dataset.type,
					target = e.target,
					value;

				value = this.getValue(target, currentTarget);
				if(value === undefined){
					return;
				}
				this.$store.dispatch(CELLS_UPDATE, {
					propNames: type,
					value
				});
				this.$emit('updateActiveWidgetId', '');
			},
			getValue(elem, currentTarget) {
				let value = elem.dataset.value;
				if (value === undefined) {
					if (elem === currentTarget) {
						return;
					} else {
						return this.getValue(elem.parentNode, currentTarget);
					}
				} else {
					return value;
				}
			},
			setBorder(e) {
				e.stopPropagation();
				let currentTarget = e.currentTarget,
					target = e.target,
					value;

				value = this.getValue(target, currentTarget);
				if(value === undefined){
					return;
				}
				this.$store.dispatch(CELLS_UPDATE_BORDER, {value});
				this.$emit('updateActiveWidgetId', '');
			},
			reverseAction(e) {
				e.stopPropagation();
				let type = e.currentTarget.dataset.type;

				this.$store.dispatch(CELLS_UPDATE, {
					propNames: type
				});
				this.$emit('updateActiveWidgetId', '');
			}
		}
	}
</script>
<style type="text/css">
	
</style>