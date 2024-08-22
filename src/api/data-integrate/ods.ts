import service from '@/utils/request'

export const useOdsApi = (id: number) => {
	return service.get('/data-integrate/ods/' + id)
}

export const useOdsSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-integrate/ods', dataForm)
	} else {
		return service.post('/data-integrate/ods', dataForm)
	}
}

export const getColumnInfoApi = (id: number, tableName: any) => {
	return service.get('/data-integrate/ods/' + id + '/' + tableName + '/column-info')
}

export const getTableDataApi = (id: number, tableName: any) => {
	return service.get('/data-integrate/ods/' + id + '/' + tableName + '/table-data')
}