"use client"

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/lib/controllers/authcontroller";
import dispositivesController, { AlertDevice } from "@/lib/controllers/dispositivescontroller";
import { Plus, Trash2, Edit, Save, X, Loader2, BellRing, CheckCircle, XCircle, ListCollapse } from "lucide-react";

export default function ManageAlertDevicesPage() {
    const { account, loading: authLoading } = useAuth();
    
    // Estados da UI
    const [devices, setDevices] = useState<AlertDevice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [editingDevice, setEditingDevice] = useState<AlertDevice | null>(null);

    // Estados do Formulário
    const [name, setName] = useState('');
    const [emails, setEmails] = useState<string[]>([]);
    const [currentEmail, setCurrentEmail] = useState('');
    const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
    const [currentPhone, setCurrentPhone] = useState('');

    // Efeito para buscar os dispositivos
    useEffect(() => {
        if (!authLoading && account?.id) {
            const fetchDevices = async () => {
                setIsLoading(true);
                try {
                    const fetchedDevices = await dispositivesController.getDevicesByAccountId(account.id);
                    setDevices(fetchedDevices);
                } catch (_error) { // FIX 1
                    setFeedback({ type: 'error', message: 'Falha ao carregar os dispositivos.' });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDevices();
        }
    }, [account, authLoading]);
    
    // Funções do formulário
    const resetForm = () => {
        setName('');
        setEmails([]);
        setCurrentEmail('');
        setPhoneNumbers([]);
        setCurrentPhone('');
        setEditingDevice(null);
        setIsSubmitting(false);
    };

    const handleAddEmail = () => {
        if (currentEmail && !emails.includes(currentEmail)) {
            setEmails([...emails, currentEmail]);
            setCurrentEmail('');
        }
    };

    const handleRemoveEmail = (index: number) => {
        setEmails(emails.filter((_, i) => i !== index));
    };

    const handleAddPhone = () => {
        if (currentPhone && !phoneNumbers.includes(currentPhone)) {
            setPhoneNumbers([...phoneNumbers, currentPhone]);
            setCurrentPhone('');
        }
    };
    
    const handleRemovePhone = (index: number) => {
        setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
    };
    
    const handleEdit = (device: AlertDevice) => {
        setEditingDevice(device);
        setName(device.name);
        setEmails(device.emails);
        setPhoneNumbers(device.phoneNumbers);
        window.scrollTo(0, 0); // Rola para o topo para ver o formulário
    };
    
    const handleDelete = async (deviceId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este grupo?')) {
            try {
                await dispositivesController.deleteDevice(deviceId);
                setDevices(devices.filter(d => d.id !== deviceId));
                setFeedback({ type: 'success', message: 'Grupo excluído com sucesso.' });
            } catch (_error) { // FIX 2
                setFeedback({ type: 'error', message: 'Falha ao excluir o grupo.' });
            }
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name || (emails.length === 0 && phoneNumbers.length === 0)) {
            setFeedback({ type: 'error', message: 'Preencha o nome e adicione ao menos um contato.' });
            return;
        }
        setIsSubmitting(true);
        setFeedback(null);

        try {
            if (editingDevice) { // Atualização
                const updatedData = { name, emails, phoneNumbers };
                await dispositivesController.updateDevice(editingDevice.id, updatedData);
                setDevices(devices.map(d => d.id === editingDevice.id ? { ...d, ...updatedData } : d));
                setFeedback({ type: 'success', message: 'Grupo atualizado com sucesso!' });
            } else { // Criação
                const newDeviceData = { accountId: account!.id, name, emails, phoneNumbers };
                const newId = await dispositivesController.createDevice(newDeviceData);
                setDevices([...devices, { id: newId, ...newDeviceData }]);
                setFeedback({ type: 'success', message: 'Grupo criado com sucesso!' });
            }
            resetForm();
        } catch (_error) { // FIX 3
            setFeedback({ type: 'error', message: 'Ocorreu um erro ao salvar.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-purple-600/10 rounded-full blur-3xl -z-0" aria-hidden="true" />
            <div className="relative z-10 max-w-5xl mx-auto space-y-12">
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">Contatos para Alertas</h1>
                    <p className="text-slate-300 mt-2 text-lg">Gerencie os grupos de contatos que receberão notificações.</p>
                </div>
                
                {/* Formulário de Adição/Edição */}
                <div className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
                    <h2 className="text-xl font-semibold text-slate-100 mb-6 flex items-center gap-3">
                        {editingDevice ? <Edit className="w-6 h-6 text-yellow-400"/> : <Plus className="w-6 h-6 text-yellow-400"/>}
                        {editingDevice ? `Editando Grupo: "${editingDevice.name}"` : 'Adicionar Novo Grupo de Contatos'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nome do Grupo */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Nome do Grupo</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Manutenção Elétrica" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Emails */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-300">Emails</label>
                                <div className="flex gap-2">
                                    <input type="email" value={currentEmail} onChange={(e) => setCurrentEmail(e.target.value)} placeholder="email@exemplo.com" className="flex-grow bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500"/>
                                    <button type="button" onClick={handleAddEmail} className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg"><Plus/></button>
                                </div>
                                <div className="space-y-2 pt-2">
                                    {emails.map((email, index) => (
                                        <div key={index} className="flex items-center justify-between bg-slate-700/30 rounded-md px-3 py-1 text-sm">
                                            <span>{email}</span>
                                            <button type="button" onClick={() => handleRemoveEmail(index)} className="text-red-400 hover:text-red-300"><XCircle className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             {/* Celulares */}
                             <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-300">Números de Celular</label>
                                <div className="flex gap-2">
                                    <input type="tel" value={currentPhone} onChange={(e) => setCurrentPhone(e.target.value)} placeholder="(99) 99999-9999" className="flex-grow bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500"/>
                                    <button type="button" onClick={handleAddPhone} className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg"><Plus/></button>
                                </div>
                                <div className="space-y-2 pt-2">
                                    {phoneNumbers.map((phone, index) => (
                                        <div key={index} className="flex items-center justify-between bg-slate-700/30 rounded-md px-3 py-1 text-sm">
                                            <span>{phone}</span>
                                            <button type="button" onClick={() => handleRemovePhone(index)} className="text-red-400 hover:text-red-300"><XCircle className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {feedback && (
                            <div className={`flex items-center gap-3 p-3 rounded-lg text-sm ${feedback.type === 'success' ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                                {feedback.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                {feedback.message}
                            </div>
                        )}

                        <div className="flex justify-end gap-4 pt-4">
                           {editingDevice && <button type="button" onClick={resetForm} className="bg-slate-600 hover:bg-slate-700 text-white font-bold px-6 py-2 rounded-lg transition-all flex items-center gap-2"><X className="w-5 h-5"/> Cancelar</button>}
                            <button type="submit" disabled={isSubmitting} className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-600 text-slate-900 font-bold px-6 py-2 rounded-lg transition-all flex items-center gap-2">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
                                {isSubmitting ? 'Salvando...' : (editingDevice ? 'Salvar Alterações' : 'Criar Grupo')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Lista de Dispositivos */}
                <div className="space-y-4">
                         <h2 className="text-xl font-semibold text-slate-100 mb-6 flex items-center gap-3">
                        {editingDevice ? <Edit className="w-6 h-6 text-yellow-400"/> : <ListCollapse className="w-6 h-6 text-yellow-400"/>}
                        {editingDevice ? `Editando Grupo: "${editingDevice.name}"` : 'Lista de Grupos de Contatos'}
                    </h2>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
                        
                    ) : devices.length > 0 ? (
                        
                        devices.map(device => (
                            <div key={device.id} className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-lg text-slate-100 flex items-center gap-2"><BellRing className="w-5 h-5 text-purple-400"/> {device.name}</h3>
                                    <div className="text-sm text-slate-400 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                        <p><strong className="text-slate-300">Emails:</strong> {device.emails.join(', ') || 'Nenhum'}</p>
                                        <p><strong className="text-slate-300">Celulares:</strong> {device.phoneNumbers.join(', ') || 'Nenhum'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 self-end md:self-center">
                                    <button onClick={() => handleEdit(device)} className="p-2 bg-slate-700 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition"><Edit className="w-5 h-5"/></button>
                                    <button onClick={() => handleDelete(device.id)} className="p-2 bg-slate-700 hover:bg-red-500/20 text-red-400 rounded-lg transition"><Trash2 className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 bg-slate-800/20 rounded-xl">
                            <p className="text-slate-400">Nenhum grupo de contatos encontrado.</p>
                            <p className="text-slate-500 text-sm">Use o formulário acima para adicionar o primeiro.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}