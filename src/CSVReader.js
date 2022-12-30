import React, { useEffect, useState } from 'react';
import { useCSVDownloader, useCSVReader } from 'react-papaparse';

export default function CSVReader(props) {

	const { CSVReader } = useCSVReader();
	const { CSVDownloader, Type } = useCSVDownloader();

	const [csvData, setCsvData] = useState();
	const [resultData, setResultData] = useState(null);

	useEffect(() => {
		if (csvData) {
			
			let finalResult = []
			let minBalance = Number.MAX_VALUE;
			let maxBalance = Number.MIN_VALUE;
			let endingBalance = 0
			let i = 0;

			for(let val of csvData) {
				const [customer_ID, date, amount] = val;
				const [mm, , yyyy] = date.split('-');
				let transactionMonth = `${mm}/${yyyy}`
				if(finalResult[i] && customer_ID !== finalResult[i]['customer_ID']){
					i++;
					minBalance = Number.MAX_VALUE;
					maxBalance = Number.MIN_VALUE;
					endingBalance = 0		
				} 


				endingBalance += parseInt(amount) === 0? 0: parseInt(amount);
				minBalance = Math.min(minBalance, endingBalance);
				maxBalance = maxBalance === Number.MIN_VALUE && endingBalance < 0 
					? Math.min(maxBalance, endingBalance)
					: Math.max(maxBalance, endingBalance);
				
				finalResult[i] = {
					customer_ID,	
					transactionMonth,
					minBalance,
					maxBalance,
					endingBalance
				}
			}

			setResultData(finalResult)
		}
	}, [csvData])

	const styles = {
		csvReader: {
		  display: 'flex',
		  flexDirection: 'row',
		  marginBottom: 10,
		},
		browseFile: {
		  width: '20%',
		},
		acceptedFile: {
		  border: '1px solid #ccc',
		  height: 45,
		  lineHeight: 2.5,
		  paddingLeft: 10,
		  width: '80%',
		},
		remove: {
		  borderRadius: 0,
		  padding: '0 20px',
		},
		progressBarBackgroundColor: {
		  backgroundColor: 'red',
		},
	};

	console.log(resultData)
	return (
		<>
			<CSVReader
				onUploadAccepted={(res) => {
					let finalData = res.data
					finalData.shift()
					finalData = finalData.filter(val => val.filter(v => v.length !== 0).length !== 0)
					setCsvData(finalData);
				}}
			>
			{({
				getRootProps,
				acceptedFile,
				ProgressBar,
				getRemoveFileProps,
			}) => (
				<>
					<div style={styles.csvReader}>
						<button type='button' {...getRootProps()} style={styles.browseFile}>
							Browse file
						</button>
						<div style={styles.acceptedFile}>
							{acceptedFile && acceptedFile.name}
						</div>
						<button {...getRemoveFileProps()} style={styles.remove}>
							Remove
						</button>
					</div>
					<ProgressBar style={styles.progressBarBackgroundColor} />
				</>
			)}
			</CSVReader>
			{resultData && (
				<CSVDownloader
					type={Type.Button}
					filename={'outputCSV'}
					bom={true}
					config={{delimiter: ','}}
					data={resultData}
				>
					Download
				</CSVDownloader>
			)}
		</>
	)
}