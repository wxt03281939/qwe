<template>
	<el-dialog v-model="visible" :title="!dataForm.id ? '新增' : '修改'" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
			<el-divider>基本配置</el-divider>
			<el-form-item label="名称" prop="name" label-width="auto">
				<el-input v-model="dataForm.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item label="入库策略" prop="strategy" label-width="auto">
				<fast-select v-model="dataForm.strategy" dict-type="metadata_collect_strategy" placeholder="请选择" clearable></fast-select>
			</el-form-item>
			<el-form-item label="任务类型" prop="taskType" label-width="auto">
				<fast-select v-model="dataForm.taskType" dict-type="metadata_collect_type" placeholder="请选择" clearable></fast-select>
			</el-form-item>
			<el-form-item label="cron表达式" prop="cron" v-if="dataForm.taskType == '2'" label-width="auto">
				<el-input v-model="dataForm.cron" placeholder="cron表达式"></el-input>
			</el-form-item>
			<el-form-item label="描述" prop="description" label-width="auto">
				<el-input type="textarea" :rows="2" v-model="dataForm.description" placeholder="描述"></el-input>
			</el-form-item>
			<el-divider>采集配置</el-divider>
			<el-form-item label="数据源" prop="dbType" label-width="auto">
				<el-radio-group v-model="dataForm.dbType" :disabled="!!dataForm.id">
					<el-radio :label="1" border>数据库</el-radio>
					<el-radio :label="2" border>中台库</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="数据库" prop="databaseId" v-if="dataForm.dbType =='1'" label-width="auto">
				<el-select v-model="dataForm.databaseId"
						  :disabled="!!dataForm.id"
						  clearable
						  filterable
						  @change="databaseChange"
				          placeholder="请选择">
				  <el-option v-for="(item,index) in dataForm.databaseList"
				             :key="item.id"
				             :label="`[${item.id}]${item.name}`"
				             :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<!-- <div v-if="!!dataForm.databaseId && dataForm.dbType =='1'" :disabled="!!dataForm.id">
				<el-form-item label="数据库类型" label-width="auto">
					<span>{{getDictLabel(store.appStore.dictList, 'database_type', currentDatabase.databaseType)}}</span>
				</el-form-item>
				<el-form-item label="主机ip" label-width="auto">
					<span>{{currentDatabase.databaseIp}}</span>
				</el-form-item>
				<el-form-item label="端口" label-width="auto">
					<span>{{currentDatabase.databasePort}}</span>
				</el-form-item>
				<el-form-item label="库名(服务名)" label-width="auto">
					<span>{{currentDatabase.databaseName}}</span>
				</el-form-item>
				<el-form-item label="用户名" label-width="auto">
					<span>{{currentDatabase.userName}}</span>
				</el-form-item>
				<el-form-item label="密码" label-width="auto">
					<span>{{currentDatabase.password}}</span>
				</el-form-item>
				<el-form-item label="jdbc连接串" label-width="auto">
					<span>{{currentDatabase.jdbcUrl}}</span>
				</el-form-item>
			</div> -->
			<el-form-item label="归属元数据目录" prop="metadataId" label-width="auto">
				<el-tree-select :disabled="!!dataForm.id" v-model="dataForm.metadataId" :data="metadataFloderList" clearable>
					<template #default="{ node, data }">
						 <div>
							 <span>
								 <img v-if="data.icon=='/src/assets/folder.png'" src="/src/assets/folder.png"/>
								 <img v-if="data.icon=='/src/assets/database.png'" src="/src/assets/database.png"/>
								 <img v-if="data.icon=='/src/assets/table.png'" src="/src/assets/table.png"/>
								 <img v-if="data.icon=='/src/assets/column.png'" src="/src/assets/column.png"/>
								 <img v-if="data.icon=='/src/assets/model.png'" src="/src/assets/model.png"/>
								 <span style="margin-left: 8px;">{{ data.name }}</span>
							 </span>
						 </div>
					</template>
				</el-tree-select>
			</el-form-item>
	    </el-form>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" @click="submitHandle()">确定</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref,onMounted } from 'vue'
import { ElMessage } from 'element-plus/es'
import { listDatabase } from '@/api/data-integrate/database'
import { getDictLabel } from '@/utils/tool'
import store from '@/store'
import { useMetadataCollectApi, useMetadataCollectSubmitApi } from '@/api/data-governance/metadataCollect'
import { listMetadataFloderApi } from '@/api/data-governance/metadata'

onMounted(()=>{
	//获取数据库列表
	getDatabaseList()
	listMetadataFloder()
})

const getDatabaseList = () => {
	listDatabase().then(res => {
		dataForm.databaseList = res.data
	})
}

const listMetadataFloder = () => {
	listMetadataFloderApi().then(res => {
		metadataFloderList.value = res.data
	})
}

const databaseChange = (databaseId) => {
	//获取数据库信息
	for(var i in dataForm.databaseList) {
		var database = dataForm.databaseList[i]
		if(database.id == databaseId) {
			//赋值
			Object.assign(currentDatabase, database)
		}
	}
}

const emit = defineEmits(['refreshDataList'])

const visible = ref(false)
const dataFormRef = ref()
const metadataFloderList = ref([])

//当前选择的数据库
const currentDatabase = reactive({
})
const dataForm = reactive({
	name: '',
	strategy: '',
	taskType: '',
	cron: '',
	description: '',
	dbType: '',
	databaseId: '',
	metadataId: '',
	databaseList: []
})

const init = (id?: number) => {
	visible.value = true
	dataForm.id = ''

	// 重置表单数据
	if (dataFormRef.value) {
		dataFormRef.value.resetFields()
	}

	if (id) {
		getMetadataCollect(id)
	}
}

const getMetadataCollect = (id: number) => {
	useMetadataCollectApi(id).then(res => {
		Object.assign(dataForm, res.data)
	})
}

const dataRules = ref({
	name: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	strategy: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	taskType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	cron: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	dbType: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	databaseId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
	metadataId: [{ required: true, message: '必填项不能为空', trigger: 'blur' }],
})

// 表单提交
const submitHandle = () => {
	dataFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return false
		}
		dataForm.databaseId = dataForm.dbType == 2 ? '' : dataForm.databaseId
		dataForm.cron = dataForm.taskType == 1 ? null : dataForm.cron
		useMetadataCollectSubmitApi(dataForm).then(() => {
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
