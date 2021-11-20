/* pages/create-item.js */
import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import { pinata_api_key, pinata_secret_api_key } from '../config'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [ipfsHash, setIpfsHash] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  async function onChange(e) {
    const file = e.target.files[0]
    try {
      var myHeaders = new Headers();
      myHeaders.append("pinata_api_key", pinata_api_key);
      myHeaders.append("pinata_secret_api_key", pinata_secret_api_key);
      var formdata = new FormData();
      formdata.append("file", file);
      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow'
      };
      
      fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", requestOptions)
      .then(response => response.text())
      .then(result => {
        const response = JSON.parse(result);
        const url = `ipfs://${response.IpfsHash}`;
        setFileUrl(url)
        setIpfsHash(`https://gateway.pinata.cloud/ipfs/${response.IpfsHash}`);
      })
      .catch(error => console.log('error', error));
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }
  async function createMarket() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    const data = JSON.stringify({
      name, description, 
      image: fileUrl,
      attributes: [
        {
          "trait_type": "Base", 
          "value": "Starfish"
        }, 
        {
          "trait_type": "Eyes", 
          "value": "Big"
        }, 
        {
          "trait_type": "Mouth", 
          "value": "Surprised"
        }, 
        {
          "trait_type": "Level", 
          "value": 5
        }, 
        {
          "trait_type": "Stamina", 
          "value": 1.4
        }, 
        {
          "trait_type": "Personality", 
          "value": "Sad"
        }, 
        {
          "display_type": "boost_number", 
          "trait_type": "Aqua Power", 
          "value": 40
        }, 
        {
          "display_type": "boost_percentage", 
          "trait_type": "Stamina Increase", 
          "value": 10
        }, 
        {
          "display_type": "number", 
          "trait_type": "Generation", 
          "value": 2
        },
        {
          "display_type": "string", 
          "value": "This is description"
        }
      ], 
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      createSale(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function createSale(url) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let transaction = await contract.mintNFT(nftaddress, url)
    await transaction.wait()
    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input 
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        {
          fileUrl && (
            <iframe className="rounded mt-4" width="100%" scrolling="no" src={ipfsHash}></iframe>
          )
        }
        <button onClick={createMarket} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Create Digital Asset
        </button>
      </div>
    </div>
  )
}