<template>
	<el-drawer v-model="visible" :title="!dataForm.id ? '新增' : '修改'" size="100%">
		<br>
		<el-steps :active="active">
		  <el-step title="基本信息配置" />
		  <el-step title="同步源端配置" />
		  <el-step title="目标端(ods)配置" />
		  <el-step title="映射转换配置" />
		  <el-step title="配置确认提交" />
		</el-steps>
		<br/>
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
			<!-- 基本信息配置 -->
			<div v-show="active == 1">
				<el-form-item label="任务名称" prop="taskName" >
					<el-input v-model="dataForm.taskName" placeholder="任务名称"></el-input>
				</el-form-item>
				<el-form-item label="描述" prop="description">
					<el-input v-model="dataForm.description" placeholder="描述"></el-input>
				</el-form-item>
				<!-- <el-form-item label="所属项目" prop="projectId">
					<fast-project-select v-model="dataForm.projectId" placeholder="所属项目"></fast-project-select>
				</el-form-item> -->
				<el-form-item label="调度类型" prop="taskType">
					<fast-radio-group v-model="dataForm.taskType" dict-type="task_type"></fast-radio-group>
				</el-form-item>
				<el-form-item label="cron表达式" prop="cron" v-if="dataForm.taskType=='3'">
					<el-input v-model="dataForm.cron" placeholder="cron表达式"></el-input>
					<!-- <el-popover ref="cronPopover" :width="550" trigger="click">
						<Cron @submit="changeCron" @close="cronPopover.hide()"></Cron>
						<template #reference>
							<el-input v-model="dataForm.cron" placeholder="cron表达式"></el-input>
						</template>
					</el-popover> -->
				</el-form-item>
			</div>
			<!-- 同步源端配置 -->
			<div v-show="active == 2">
				<el-form-item label="源端数据库" prop="sourceDatabaseId">
					<el-select v-model="dataForm.sourceDatabaseId"
					           @change="selectChangedSourceDatabase"
										 clearable
										 filterable 
					           placeholder="请选择">
					  <el-option v-for="(item,index) in dataForm.databases"
					             :key="item.id"
					             :label="`[${item.id}]${item.name}`"
					             :value="item.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="配置方式"
				              prop="includeOrExclude">
				  <el-select placeholder="请选择配置方式"
				             v-model="dataForm.includeOrExclude">
				    <el-option label="包含表"
				               :value="1"></el-option>
				    <el-option label="排除表"
				               :value="0"></el-option>
				  </el-select>
				</el-form-item>
				<el-form-item label="表名配置"
				              prop="sourceSelectedTables">
				  <el-select placeholder="请选择表名"
				             multiple
										 filterable
										 clearable
				             v-model="dataForm.sourceSelectedTables">
				    <el-option v-for="(item,index) in dataForm.sourceTables"
				               :key="item.tableName"
				               :label="item.tableName"
				               :value="item.tableName"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="当为包含表时，选择所要精确包含的表名，如果不选则代表选择所有；当为排除表时，选择需要精确排除的表名。">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
			</div>
			<!-- 目标端配置 -->
			<div v-show="active == 3">
				<el-form-item label="接入方式" label-width="auto"
				              prop="accessMode">
				  <el-select placeholder="请选择接入方式"
				             v-model="dataForm.accessMode">
				    <el-option label="接入到ods层"
				               :value="1"></el-option>
				    <el-option label="自定义接入"
				               :value="2"></el-option>
				  </el-select>
				</el-form-item>
				<el-form-item label="接入数据库" v-if="dataForm.accessMode=='2'" label-width="auto"
				              prop="targetDatabaseId">
				  <el-select v-model="dataForm.targetDatabaseId"
										 @change="selectChangedTargetDatabase"
										 clearable
										 filterable
				             placeholder="请选择">
				    <el-option v-for="(item,index) in dataForm.databases"
				               :key="item.id"
				               :label="`[${item.id}]${item.name}`"
				               :value="item.id"></el-option>
				  </el-select>
				</el-form-item>
				<el-form-item label="只创建表" label-width="auto"
				              prop="targetOnlyCreate">
				  <el-select v-model="dataForm.targetOnlyCreate">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="只在目标端创建表，不同步数据内容。">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="是否同步已存在的表" label-width="auto"
				              prop="targetSyncExit">
				  <el-select v-model="dataForm.targetSyncExit">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
				</el-form-item>
				<el-form-item label="同步前是否删除目的表" label-width="auto"
				              prop="targetDropTable">
				  <el-select v-model="dataForm.targetDropTable">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
				</el-form-item>
				<el-form-item label="是否启用增量变更同步" label-width="auto"
				              prop="targetDataSync" v-if="!dataForm.targetDropTable">
				  <el-select v-model="dataForm.targetDataSync">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="表不存在时会自动建表">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="是否同步索引" label-width="auto"
				              prop="targetIndexCreate">
				  <el-select v-model="dataForm.targetIndexCreate">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="仅生效于部分数据库,表不存在时建表时才生效">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="是否表名字段名转小写" label-width="auto"
											v-if="!dataForm.targetUpperCase && dataForm.accessMode =='2'"
				              prop="targetLowerCase">
				  <el-select v-model="dataForm.targetLowerCase">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="表不存在时建表时才生效">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="是否表名字段名转大写" label-width="auto"
											v-if="!dataForm.targetLowerCase && dataForm.accessMode =='2'"
				              prop="targetUpperCase">
				  <el-select v-model="dataForm.targetUpperCase">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="表不存在时建表时才生效">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="是否主键自动递增" label-width="auto"
				              prop="targetAutoIncrement">
				  <el-select v-model="dataForm.targetAutoIncrement">
				    <el-option label='是'
				               :value="true"></el-option>
				    <el-option label='否'
				               :value="false"></el-option>
				  </el-select>
					<el-tooltip placement="top"  content="仅生效于部分数据库,表不存在时生效">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="数据处理批次大小" label-width="auto"
				              prop="batchSize">
				  <el-select v-model="dataForm.batchSize">
				    <el-option label="1000"
				               :value="1000"></el-option>
				    <el-option label="5000"
				               :value="5000"></el-option>
				    <el-option label="10000"
				               :value="10000"></el-option>
				    <el-option label="50000"
							  :value="50000"></el-option>
					<el-option label="100000"
							  :value="100000"></el-option>		  
				  </el-select>
					<el-tooltip placement="top"  content="数据同步时单个批次处理的行记录总数，该值越大越占用内存空间。建议：小字段表设置为10000，大字段表设置为1000">
					   <el-icon><QuestionFilled /></el-icon>
					</el-tooltip>
				</el-form-item>
			</div>
			<!-- 映射转换配置 -->
			<div v-show="active == 4">
				<div class="tip-content">
					<p>说明：</p>
					<br>
					<p> (1) 支持正则表达式匹配，也可直接填写需要映射的表名。 </p>
					<br>
				  <p> (2) 当表名映射规则为空时，若接入方式为接入到ods层，会自动给表名添加ods_前缀，否则代表目标表名与源表名的名称相同; 不为空时，若接入方式为接入到ods层，会自动给映射的表名添加ods_前缀，否则与映射的表名一致。</p>
				  <br>
					<p> (3) 当字段名映射规则记录为空时，代表目标表的字段名与源表名的字段名相同；不为空时，与映射的字段名一致。</p>
					<br>
					<p> (4) 若不想同步某个字段，填写源端字段之后，目标字段名映射留空即可。 </p>
				</div>
				<br>
				<el-button type="success"
				           @click="addTableNameMapperListRow()"
				           round>添加表名映射</el-button>
				<el-button type="primary"
				           @click="previewTableNameMapList()"
				           round>预览表名映射</el-button>
				<el-table :data="dataForm.tableNameMapper"
				          size="small"
				          border
				          height="200"
				          style="width:90%;margin-top: 15px;">
				  <template #empty>
				    <span>请点击"添加表名映射"按钮添加表名映射关系记录</span>
				  </template>
				  <el-table-column label="表名匹配的正则名"
				                   width="320">
				    <template #default="scope">
				      <el-input v-model="scope.row.fromPattern"
				                type="string"> </el-input>
				    </template>
				  </el-table-column>
				  <el-table-column label="替换的目标值"
				                   width="320">
				    <template #default="scope">
				      <el-input v-model="scope.row.toValue"
				                type="string" ></el-input>
				    </template>
				  </el-table-column>
				  <el-table-column label="操作"
				                   width="220">
				    <template #default="scope">
				      <el-button size="small"
				                 type="danger"
				                 @click="deleteTableNameMapperListItem(scope.$index)">删除</el-button>
				    </template>
				  </el-table-column>
				</el-table>
				
				<el-button type="success"
				           @click="addColumnNameMapperListRow()"
				           round>添加字段名映射</el-button>
				<el-button type="primary"
				           @click="previewColumnNameMapList()"
				           round>预览字段名映射</el-button>
				<el-table :data="dataForm.columnNameMapper"
				          size="small"
				          border
				          height="200"
				          style="width:90%;margin-top: 15px;">
				  <template #empty>
				    <span>请点击"添加字段名映射"按钮添加字段名映射关系记录</span>
				  </template>
				  <el-table-column label="字段名匹配的正则名"
				                   width="320">
				    <template #default="scope">
				      <el-input v-model="scope.row.fromPattern"
				                type="string"> </el-input>
				    </template>
				  </el-table-column>
				  <el-table-column label="替换的目标值"
				                   width="320">
				    <template #default="scope">
				      <el-input v-model="scope.row.toValue"
				                type="string"></el-input>
				    </template>
				  </el-table-column>
				  <el-table-column label="操作"
				                   width="220">
				    <template #default="scope">
				      <el-button size="small"
				                 type="danger"
				                 @click="deleteColumnNameMapperListItem(scope.$index)">删除</el-button>
				    </template>
				  </el-table-column>
				</el-table>
			</div>
			
			<div v-show="active == 5">
				<el-descriptions size="default"
				                 :column="1"
				                 label-class-name="el-descriptions-item-label-class"
				                 border>
				  <el-descriptions-item label="任务名称">{{dataForm.taskName}}</el-descriptions-item>
				  <el-descriptions-item label="任务描述">{{dataForm.description}}</el-descriptions-item>
				  <el-descriptions-item label="调度类型">
				    <span v-if="dataForm.taskType == '1'">
				      实时同步
				    </span>
				    <span v-if="dataForm.taskType == '2'">
				      一次性全量同步
				    </span>
						<span v-if="dataForm.taskType == '3'">
						  一次性全量周期性增量
						</span>
				  </el-descriptions-item>
				  <el-descriptions-item v-if="dataForm.taskType == '3'"
				                        label="cron表达式">{{dataForm.cron}}</el-descriptions-item>
				  <el-descriptions-item label="源端数据库">[{{dataForm.sourceDatabaseId}}]{{dataForm.sourceDatabase.name}}</el-descriptions-item>
				  <el-descriptions-item label="源端表选择方式">
				    <span v-if="dataForm.includeOrExclude == '1'">
				      包含表
				    </span>
				    <span v-if="dataForm.includeOrExclude == '0'">
				      排除表
				    </span>
				  </el-descriptions-item>
				  <el-descriptions-item label="源端表名列表">
				    <span v-show="dataForm.includeOrExclude == '1' && (!dataForm.sourceSelectedTables || dataForm.sourceSelectedTables.length==0)"><b>所有物理表</b></span>
				    <p v-for="item in dataForm.sourceSelectedTables"
				       v-bind:key="item">{{item}}</p>
				  </el-descriptions-item>
				  <el-descriptions-item label="目地端数据源" v-if="dataForm.accessMode =='2'">[{{dataForm.targetDatabaseId}}]{{dataForm.targetDatabase.name}}</el-descriptions-item>
				  <el-descriptions-item label="只创建表">{{dataForm.targetOnlyCreate}}</el-descriptions-item>
					<el-descriptions-item label="是否同步已存在的表">{{dataForm.targetSyncExit}}</el-descriptions-item>
					<el-descriptions-item label="同步前是否先删除目的表">{{dataForm.targetDropTable}}</el-descriptions-item>
					<el-descriptions-item label="是否启用增量变更同步" v-if="!dataForm.targetDropTable">{{dataForm.targetDataSync}}</el-descriptions-item>
					<el-descriptions-item label="是否创建索引" v-if="dataForm.targetDropTable">{{dataForm.targetIndexCreate}}</el-descriptions-item>
					<el-descriptions-item label="是否表名字段名转小写" v-if="dataForm.targetDropTable">{{dataForm.targetLowerCase}}</el-descriptions-item>
					<el-descriptions-item label="是否表名字段名转大写" v-if="dataForm.targetDropTable">{{dataForm.targetUpperCase}}</el-descriptions-item>
					<el-descriptions-item label="是否主键自动递增" v-if="dataForm.targetDropTable">{{dataForm.targetAutoIncrement}}</el-descriptions-item>
				  <el-descriptions-item label="数据处理批次量">{{dataForm.batchSize}}</el-descriptions-item>
				  <el-descriptions-item label="表名映射规则">
				    <span v-show="dataForm.tableNameMapper.length==0">[映射关系为空]</span>
				    <table v-if="dataForm.tableNameMapper.length>0"
				           class="name-mapper-table">
				      <tr>
				        <th>表名匹配的正则名</th>
				        <th>替换的目标值</th>
				      </tr>
				      <tr v-for='(item,index) in dataForm.tableNameMapper'
				          :key="index">
				        <td>{{item['fromPattern']}}</td>
				        <td>{{item['toValue']}}</td>
				      </tr>
				    </table>
				  </el-descriptions-item>
				  <el-descriptions-item label="字段名映射规则">
				    <span v-show="dataForm.columnNameMapper.length==0">[映射关系为空]</span>
				    <table v-if="dataForm.columnNameMapper.length>0"
				           class="name-mapper-table">
				      <tr>
				        <th>字段名匹配的正则名</th>
				        <th>替换的目标值</th>
				      </tr>
				      <tr v-for='(item,index) in dataForm.columnNameMapper'
				          :key="index">
				        <td>{{item['fromPattern']}}</td>
				        <td>{{item['toValue']}}</td>
				      </tr>
				    </table>
				  </el-descriptions-item>
				</el-descriptions>
			</div>
		</el-form>
		<template #footer>
			<el-button round size="large"
			           v-if="active > 1"
			           @click="pre()">
			  上一步
			</el-button>
			<el-button round size="large"
			           @click="next()"
			           v-if="active > 0 && active < 5">
			  下一步
			</el-button>
			<el-button type="primary" round size="large"
			           @click="submitHandle()"
			           v-if="active == 5">
			  提交
			</el-button>
		</template>
		
		<el-dialog v-if="active == 4"
		           title="查看表名映射关系"
		           v-model="tableNameMapperDialogVisible">
		  <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}"
		            :data="tableNamesMapperData"
		            size="small"
		            border>
		    <el-table-column prop="originalName"
		                     label="源端表名"
		                     min-width="20%"></el-table-column>
		    <el-table-column prop="targetName"
		                     label="目标表名"
		                     min-width="20%"></el-table-column>
		  </el-table>
		</el-dialog>
		
		<el-dialog v-if="active == 4"
		           title="查看字段映射关系"
		           v-model="columnNameMapperDialogVisible">
		  <el-select @change="queryPreviewColumnNameMapperList"
		             v-model="preiveTableName"
								 clearable
								 filterable
		             placeholder="请选择">
		    <el-option v-for="(item,index) in preiveSeeTableNameList"
		               :key="index"
		               :label="item"
		               :value="item"></el-option>
		  </el-select>
			<br >
			<br >
		  <el-table :header-cell-style="{background:'#eef1f6',color:'#606266'}"
		            :data="columnNamesMapperData"
		            size="small"
		            border>
		    <el-table-column prop="originalName"
		                     label="原始字段名"
		                     min-width="20%"></el-table-column>
		    <el-table-column prop="targetName"
		                     label="目标表字段名"
		                     min-width="20%"></el-table-column>
		  </el-table>
		</el-dialog>
	</el-drawer>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus/es'
import { useAccessApi, useAccessSubmitApi, previewTableNameMap, previewColumnNameMap } from '@/api/data-integrate/access'
import { listDatabase, getTablesById } from '@/api/data-integrate/database'
import Cron from '@/components/fast-cron/index'

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()

const active = ref(1)
const dataForm = reactive({
	taskName: '',
	description: '',
	projectId: '',
	sourceDatabaseId: '',
	sourceDatabase: {},
	taskType: '',
	cron: '',
	databases: [],
	includeOrExclude: 1,
	sourceTables: [],
	sourceSelectedTables: [],
	accessMode: 1,
	targetDatabaseId: '', 
	targetDatabase: {},
	targetOnlyCreate: false,
	targetSyncExit: true,
	targetDropTable: true,
	targetDataSync: false,
	targetIndexCreate: false,
	targetLowerCase: false,
	targetUpperCase: false,
	targetAutoIncrement: false,
	batchSize: 1000,
	tableNameMapper: [],
	columnNameMapper: [],
	})

const cronPopover = ref()
const changeCron = (val: any) => {
	dataForm.cron = val
}

onMounted(() => {
	listDatabase().then(res => {
		dataForm.databases = res.data
	})
})

const init = (id?: number) => {
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}

	if (id) {
		getAccess(id)
	}
}

const getAccess = (id: number) => {
	useAccessApi(id).then(res => {
		Object.assign(dataForm, res.data)
		
		if (dataForm.sourceDatabaseId) {
			dataForm.sourceDatabase = dataForm.databases.find((item) => {
				return item.id == dataForm.sourceDatabaseId
			})
			//获取库所包含的表
			getTablesById(dataForm.sourceDatabaseId).then( res => {
				dataForm.sourceTables = res.data
			})
		}
		if (dataForm.targetDatabaseId) {
			dataForm.targetDatabase = dataForm.databases.find((item) => {
				return item.id == dataForm.targetDatabaseId
			})
		}
	})
}

const dataRules = ref({
	taskName: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	/* projectId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }], */
	sourceDatabaseId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	taskType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	cron: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	includeOrExclude: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	accessMode: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetOnlyCreate: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetSyncExit: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetDropTable: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetDataSync: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetIndexCreate: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetLowerCase: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetUpperCase: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetDatabaseId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	targetAutoIncrement: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	batchSize: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

const pre = () => {
	 if (active.value-- < 2) active.value = 1
}

const next = () => {
	if (active.value++ > 4) active.value = 5
}

//源端数据库变化
const selectChangedSourceDatabase = (id) => {
	if (!id) {
		return
	}
	dataForm.sourceDatabase = dataForm.databases.find((item) => {
		return item.id == id
	})
	dataForm.sourceSelectedTables = []
	//获取库所包含的表
	getTablesById(id).then( res => {
		dataForm.sourceTables = res.data
	})
}
//目的端数据库变化
const selectChangedTargetDatabase = (id) => {
	if(!id) {
		return
	}
	dataForm.targetDatabase = dataForm.databases.find((item) => {
		return item.id == id
	})
}

//添加表名映射
const addTableNameMapperListRow = () => {
  dataForm.tableNameMapper.push({ "fromPattern": "", "toValue": "" });
}

const deleteTableNameMapperListItem = (index) => {
	 dataForm.tableNameMapper.splice(index, 1);
}

const addColumnNameMapperListRow = () => {
   dataForm.columnNameMapper.push({ "fromPattern": "", "toValue": "" });
}

const deleteColumnNameMapperListItem = (index) => {
	 dataForm.columnNameMapper.splice(index, 1);
}

const tableNamesMapperData = ref([])
const tableNameMapperDialogVisible = ref(false)
//预览表名映射
const previewTableNameMapList = () => {
	if (!dataForm.sourceDatabaseId) {
		ElMessage({
		   message: '请选择【源端数据库】！',
		   type: 'warning',
		 })
	  return;
	}
	
	//调用方法
	previewTableNameMap(JSON.stringify({
          sourceDatabaseId: dataForm.sourceDatabaseId,
          includeOrExclude: dataForm.includeOrExclude,
          sourceSelectedTables: dataForm.sourceSelectedTables,
          tableNameMapper: dataForm.tableNameMapper,
					targetLowerCase: dataForm.accessMode == '1' ? true : dataForm.targetLowerCase,
					targetUpperCase: dataForm.accessMode == '1' ? false : dataForm.targetUpperCase,
					tablePrefix: dataForm.accessMode == '1' ? 'ods_' : '',
        })).then( res=> {
					tableNamesMapperData.value = res.data;
					tableNameMapperDialogVisible.value = true;
	})
}

const preiveSeeTableNameList = ref([])
const preiveTableName = ref("")
const columnNamesMapperData = ref([])
const columnNameMapperDialogVisible = ref(false)
//预览字段名映射
const previewColumnNameMapList = () => {
	if (!dataForm.sourceDatabaseId) {
		ElMessage({
		   message: '请选择【源端数据库】！',
		   type: 'warning',
		 })
	  return;
	}
	if (dataForm.includeOrExclude == "1") {
		if (dataForm.sourceSelectedTables.length == 0) {
			preiveSeeTableNameList.value = dataForm.sourceTables.map(item => {
				return item.tableName
			})
		} else {
			preiveSeeTableNameList.value = dataForm.sourceSelectedTables
		}
	} else {
		preiveSeeTableNameList.value = dataForm.sourceTables.map(item => {
			return item.tableName
		})
		// 去除排除的表
		 for (var i = 0; i < dataForm.sourceSelectedTables.length; i++) {
			 var exclude = dataForm.sourceSelectedTables[i];
			 preiveSeeTableNameList.value.some((item, index) => {
				 if (item == exclude) {
					 preiveSeeTableNameList.value.splice(index, 1)
					 return true;
				 }
			 })
		 }
	}
	preiveTableName.value = "";
	columnNamesMapperData.value = [];
	columnNameMapperDialogVisible.value = true;
}
//根据选择的表名查看映射的字段
const queryPreviewColumnNameMapperList = () => {
	if (!dataForm.sourceDatabaseId) {
		ElMessage({
		   message: '请选择【源端数据库】！',
		   type: 'warning',
		 })
	  return;
	}
	if (!preiveTableName.value) {
	  ElMessage({
	     message: '请选择一个表名！',
	     type: 'warning',
	   })
	  return;
	}
	previewColumnNameMap(JSON.stringify({
          sourceDatabaseId: dataForm.sourceDatabaseId,
          includeOrExclude:dataForm.includeOrExclude,
          preiveTableName: preiveTableName.value,
          columnNameMapper: dataForm.columnNameMapper,
					targetLowerCase: dataForm.accessMode == '1' ? true : dataForm.targetLowerCase,
					targetUpperCase: dataForm.accessMode == '1' ? false : dataForm.targetUpperCase,
					tablePrefix: dataForm.accessMode == '1' ? 'ods_' : '',
        })).then( res=> {
					columnNamesMapperData.value = res.data
	})
}

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			 ElMessage({
			    message: '请将每一步的参数必填项填写完毕后再提交！',
			    type: 'warning',
			  })
			return false
		}

	  //如果不是周期性增量同步
		if(dataForm.taskType != '3') {
			dataForm.cron = ''
		}
		//ods接入
		if(dataForm.accessMode == '1') {
			dataForm.targetDatabaseId = ''
			dataForm.targetLowerCase = true
			dataForm.targetDatabase = {}
		}
		useAccessSubmitApi(dataForm).then(() => {
			ElMessage.success({
				message: '操作成功',
				duration: 500,
				onClose: () => {
					visible.value = false
					emit('refreshDataList')
				}
			})
		})
	})
}

defineExpose({
	init
})
</script>

<style scoped>
	.tip-content {
	  font-size: 14px;
	}
</style>